import User from "../models/User.js";
import Employer from "../models/Employer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "./../utils/appError.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { signupSchema, loginSchema } from "../schema/auth.schema.js";

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

  // check if the user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // if no issues , create the user

  // but before creating the user , we need to determine the account status based on the role
  // if the role is EMPLOYEE , then the account status will be ACTIVE
  // if the role is EMPLOYER , then the account status will be PENDING ( waiting for admin approval )

  const accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    gender,
    role,
    telephone: telephone || [],
    age,
    accountStatus, // it will be based on the role
  });

  if (role === "EMPLOYER" && company) {
    await Employer.create({
      userId: user._id,
      company,
    });
  }

  // Gen token for the user
  const token = generateToken(user._id);

  // now we return the user data without the password

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
  };

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: userResponse,
      token: token,
    },
  });
});

// ================================== //
//            LOGIN USER              //
// ======================.============ //
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
    return next(
      new AppError(
        `Account is not active. Current status: ${user.accountStatus}`,
        403,
      ),
    );
  }

  const isPasswordValid = await user.comparePassword(String(password));

  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }
  // Gen token for the user
  const token = generateToken(user._id);

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
  };

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      user: userResponse,
    },
  });
});

// ================================== //
//       GET CURRENT LOGGED IN USER   //
// ================================== //

export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return next(new AppError("User not Found", 404));
  }
  res.status(200).json({
    success: true,
    data: {
      user,
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
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}/api/users/resetpassword/${resetToken}`;

  // const message = `forget your password ? please submit a patch request to : ${resetURL}`;
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
                If you didn’t request a password reset, you can safely ignore this email.
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
    res.status(200).json({
      status: "success",
      message: "Token has been sent to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("An error occured when sending the email", 500));
  }
});
export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is invalid or has experied", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = generateToken(user._id);
  res.status(200).json({
    status: "success",
    token: token,
  });
});

// ================================== //
//     UPDATE USER'S CURRENT PASSWORD //
// ================================== //

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("This user does not exist", 400));
  }
  if (!(await user.comparePassword(String(req.body.passwordCurrent)))) {
    return next(new AppError("You're current password is wrong ", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  const token = generateToken(user._id);
  res.status(200).json({
    status: "success",
    token: token,
  });
});
