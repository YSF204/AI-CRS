import catchAsync from "../utils/catchAsync.js";
import { signupSchema, loginSchema } from "../schema/auth.schema.js";
import AppError from "./../utils/appError.js";
import { registerUser } from "../services/auth/commands/registerUser.js";
import { loginUser } from "../services/auth/commands/loginUser.js";
import { getCurrentUserProfile } from "../services/auth/queries/getCurrentUserProfile.js";
import { sendPasswordResetEmail } from "../services/auth/commands/sendPasswordResetEmail.js";
import { resetUserPassword } from "../services/auth/commands/resetUserPassword.js";
import { updateUserPassword } from "../services/auth/commands/updateUserPassword.js";
import User from "../models/User.js";
import Employer from "../models/Employer.js";
import { sendEmail } from "../utils/email.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { getCacheJson, setCacheJson } from "../utils/redisHelper.js";
import { getTrustedFrontendUrl } from "../config/security.js";

// ================================== //
//       Redis                        //
// ================================== //
// ================================== //
//       REGISTER NEW USER            //
// ================================== //

export const register = catchAsync(async (req, res, next) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors.map((err) => err.message).join(", ");
    return next(new AppError(message, 400));
  }

  const {
    firstName,
    lastName,
    email,
    password,
    gender,
    role,
    telephone,
    age,
    passwordConfirm,
    company,
  } = result.data;

  // FIX: Server-side ADMIN registration guard.
  // The schema already excludes ADMIN from the enum, but we add an explicit
  // check here as defence-in-depth — in case the schema is ever changed or
  // bypassed via a raw API request.
  if (role?.toUpperCase() === "ADMIN") {
    return next(
      new AppError("You cannot self-register as ADMIN.", 403),
    );
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    // If the account exists but email is NOT verified, give a helpful message
    // instead of a generic error (this prevents confusion after a failed first attempt
    // where the DB record was created but something went wrong afterward).
    if (!existingUser.isEmailVerified) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists but has not been verified yet. " +
          "Please check your inbox or request a new verification email.",
        requiresEmailVerification: true,
        emailNotVerified: true,
        email: existingUser.email,
      });
    }
    return next(new AppError("User with this email already exists", 400));
  }

  // Determine account status based on role:
  // EMPLOYEE → ACTIVE, EMPLOYER → PENDING (waiting for admin approval)
  const normalizedRole = role?.toUpperCase();
  const accountStatus = normalizedRole === "EMPLOYER" ? "PENDING" : "ACTIVE";

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    gender,
    role: normalizedRole,
    telephone: telephone || [],
    age,
    accountStatus,
    isEmailVerified: false,
  });

  // Create the Employer record (if applicable) before we do anything else
  // so we know what to roll back if something goes wrong below.
  let employerDoc = null;
  if (normalizedRole === "EMPLOYER" && company) {
    employerDoc = await Employer.create({
      userId: user._id,
      company,
    });
  }

  // Generate email verification token and persist it.
  // Wrapped in try/catch so we can roll back the user (and employer) record if
  // anything here fails — otherwise the DB keeps the user but the frontend
  // shows an error, and the NEXT registration attempt hits "already exists".
  let verificationToken;
  try {
    verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
  } catch (setupErr) {
    // Roll back: delete the just-created user (and employer) so the user
    // can retry registration cleanly.
    await User.findByIdAndDelete(user._id);
    if (employerDoc) await Employer.findByIdAndDelete(employerDoc._id);
    return next(
      new AppError(
        "Registration could not be completed. Please try again.",
        500,
      ),
    );
  }

  // Build verification email HTML
  const verificationURL = `${getTrustedFrontendUrl()}/verify-email/${verificationToken}`;
  const htmlMessage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table width="100%" max-width="520px" style="
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        ">
          <tr>
            <td align="center">
              <h1 style="
                margin: 0;
                font-size: 24px;
                color: #111827;
                margin-bottom: 16px;
              ">
                Verify Your Email Address
              </h1>

              <p style="
                margin: 16px 0 24px;
                font-size: 15px;
                color: #4b5563;
                line-height: 1.6;
              ">
                Welcome to <strong>AI-CRS</strong>! To complete your registration and unlock all features, please verify your email address by clicking the button below.
              </p>

              <a href="${verificationURL}" style="
                display: inline-block;
                padding: 14px 28px;
                background-color: #4ECDC4;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
              ">
                Verify Email
              </a>

              <p style="
                margin: 24px 0 0;
                font-size: 13px;
                color: #6b7280;
              ">
                This link will expire in <strong>24 hours</strong>.
              </p>

              <hr style="
                margin: 32px 0;
                border: none;
                border-top: 1px solid #e5e7eb;
              " />

              <p style="
                font-size: 13px;
                color: #9ca3af;
                line-height: 1.5;
              ">
                If you didn't create this account, you can safely ignore this email.
              </p>

              <p style="
                margin-top: 24px;
                font-size: 12px;
                color: #9ca3af;
              ">
                © ${new Date().getFullYear()} AI-CRS App
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your AI-CRS account email address",
      html: htmlMessage,
      text: `Verify your email using this link (valid for 24 hours): ${verificationURL}`,
    });
  } catch (err) {
    // Even if email fails, don't fail signup - user can request new verification email later
    console.error("Error sending verification email:", err.message);
  }

  // Do NOT generate a login token for unverified email.
  // User must verify email first before logging in.
  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    age: user.age,
    telephone: user.telephone,
    accountStatus: user.accountStatus,
    isEmailVerified: user.isEmailVerified,
  };

  res.status(201).json({
    success: true,
    message:
      "User registered successfully. Please check your email to verify your account.",
    emailSent: true,
    requiresEmailVerification: true,
    data: {
      user: userResponse,
    },
  });
});

// ================================== //
//            LOGIN USER              //
// ================================== //
export const login = catchAsync(async (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors.map((err) => err.message).join(", ");
    return next(new AppError(message, 400));
  }

  const { email, password } = result.data;

  // find the user by the email
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // check if the Account is ACTIVE or not
  if (user.accountStatus !== "ACTIVE") {
    return res.status(403).json({
      success: false,
      message: `Account is not active. Current status: ${user.accountStatus}`,
      role: user.role,
      accountStatus: user.accountStatus,
    });
  }

  const isPasswordValid = await user.comparePassword(String(password));

  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if email is verified before allowing login
  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first. Check your inbox or request a new verification link.",
      isEmailVerified: false,
    });
  }

  // Gen token for the user
  const token = generateToken(user._id, user.role);

  // return user
  const userResponse = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    gender: user.gender,
    age: user.age,
    telephone: user.telephone,
    accountStatus: user.accountStatus,
    isEmailVerified: user.isEmailVerified,
  };

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: token,
    data: {
      user: userResponse,
    },
  });
});

// ================================== //
//       GET CURRENT LOGGED IN USER   //
// ================================== //

export const getCurrentUser = catchAsync(async (req, res, next) => {
  const cacheKey = `user:me:${req.user._id}`;
  const cachedUser = await getCacheJson(cacheKey);

  if (cachedUser) {
    return res.status(200).json({
      success: true,
      data: {
        user: cachedUser,
        source: "cache",
      },
    });
  }

  const user = await getCurrentUserProfile({ userId: req.user._id });

  await setCacheJson(cacheKey, user, 3600);

  res.status(200).json({
    success: true,
    data: {
      user,
      source: "database",
    },
  });
});


// ================================== //
//       LOGOUT USER                  //
// ================================== //

export const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Error in user logout:", error);
    res.status(500).json({
      success: false,
      message: "Logout has failed",
      error: error.message,
    });
  }
};

// ================================== //
//       RESET PASSWORD VIA EMAIL      //
// ================================== //

export const forgotPassword = catchAsync(async (req, res, next) => {
  const genericResponse = {
    status: "success",
    message:
      "If an account exists for that email, a password reset link will be sent shortly.",
  };
  const normalizedEmail = String(req.body.email || "").toLowerCase().trim();
  if (!normalizedEmail) {
    return res.status(200).json(genericResponse);
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(200).json(genericResponse);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${getTrustedFrontendUrl()}/reset-password?token=${resetToken}`;

  const htmlMessage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table width="100%" max-width="520px" style="
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        ">
          <tr>
            <td align="center">
              <h1 style="
                margin: 0;
                font-size: 24px;
                color: #111827;
              ">
                Reset your password
              </h1>

              <p style="
                margin: 16px 0 24px;
                font-size: 15px;
                color: #4b5563;
                line-height: 1.6;
              ">
                You requested to reset your password for your
                <strong>AI-CRS App</strong> account.
                Click the button below to set a new password.
              </p>

              <a href="${resetURL}" style="
                display: inline-block;
                padding: 14px 28px;
                background-color: #4f46e5;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
              ">
                Reset Password
              </a>

              <p style="
                margin: 24px 0 0;
                font-size: 13px;
                color: #6b7280;
              ">
                This link will expire in <strong>10 minutes</strong>.
              </p>

              <hr style="
                margin: 32px 0;
                border: none;
                border-top: 1px solid #e5e7eb;
              " />

              <p style="
                font-size: 13px;
                color: #9ca3af;
                line-height: 1.5;
              ">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>

              <p style="
                margin-top: 24px;
                font-size: 12px;
                color: #9ca3af;
              ">
                © ${new Date().getFullYear()} AI-CRS App
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password token valid for (10 min)",
      html: htmlMessage,
      text: `Reset your password using this link (valid for 10 minutes): ${resetURL}`,
    });
    res.status(200).json(genericResponse);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("Password reset email send failed:", err.message);
    return res.status(200).json(genericResponse);
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const resultData = await resetUserPassword({
    rawToken: req.params.token,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(200).json({
    status: "success",
    token: resultData.token,
  });
});

// ================================== //
//     UPDATE USER'S CURRENT PASSWORD //
// ================================== //

export const updatePassword = catchAsync(async (req, res, next) => {
  const resultData = await updateUserPassword({
    userId: req.user.id,
    currentPassword: req.body.passwordCurrent,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  res.status(200).json({
    status: "success",
    token: resultData.token,
  });
});

// ================================== //
//   VERIFY EMAIL                      //
// ================================== //

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new AppError("Verification token is required", 400));
  }

  // Hash the token to match what's in the database
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with matching token and token not expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError(
        "Token is invalid or has expired. Please request a new verification email.",
        400,
      ),
    );
  }

  // Mark email as verified
  await User.findByIdAndUpdate(user._id, {
    isEmailVerified: true,
    emailVerificationToken: undefined,
    emailVerificationExpires: undefined,
  });

  res.status(200).json({
    success: true,
    message: "Email verified successfully! You can now log in.",
  });
});

// ================================== //
//   RESEND VERIFICATION EMAIL        //
// ================================== //

export const resendVerificationEmail = catchAsync(async (req, res, next) => {
  const genericResponse = {
    success: true,
    message:
      "If the account needs verification, a verification email will arrive shortly.",
  };
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(200).json(genericResponse);
  }

  if (user.isEmailVerified) {
    return res.status(200).json(genericResponse);
  }

  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const verificationURL = `${getTrustedFrontendUrl()}/verify-email/${verificationToken}`;

  const htmlMessage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f6f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table width="100%" max-width="520px" style="
          background-color: #ffffff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        ">
          <tr>
            <td align="center">
              <h1 style="
                margin: 0;
                font-size: 24px;
                color: #111827;
                margin-bottom: 16px;
              ">
                Verify Your Email Address
              </h1>

              <p style="
                margin: 16px 0 24px;
                font-size: 15px;
                color: #4b5563;
                line-height: 1.6;
              ">
                Please verify your email address by clicking the button below.
              </p>

              <a href="${verificationURL}" style="
                display: inline-block;
                padding: 14px 28px;
                background-color: #4ECDC4;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 15px;
              ">
                Verify Email
              </a>

              <p style="
                margin: 24px 0 0;
                font-size: 13px;
                color: #6b7280;
              ">
                This link will expire in <strong>24 hours</strong>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Verify your AI-CRS account email address",
      html: htmlMessage,
      text: `Verify your email using this link (valid for 24 hours): ${verificationURL}`,
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.error("Verification resend email send failed:", err.message);
    return res.status(200).json(genericResponse);
  }

  res.status(200).json(genericResponse);
});
