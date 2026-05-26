import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Employer from "../models/Employer.js";
import { mapUserResponse } from "../services/shared/userResponseMapper.js";
import { sendEmail } from "../utils/email.js";
import { getTrustedFrontendUrl } from "../config/security.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sendGoogleVerificationEmail = async (user) => {
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

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
                Welcome to <strong>AI-CRS</strong>! Please verify your email address by clicking the button below.
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

  await sendEmail({
    email: user.email,
    subject: "Verify your AI-CRS account email address",
    html: htmlMessage,
    text: `Verify your email using this link (valid for 24 hours): ${verificationURL}`,
  });
};

// Google auth
export const googleAuth = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) return next(new AppError("Google token is required", 400));

  // verify the token
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return next(new AppError("Invalid Google token", 401));
  }

  const payload = ticket.getPayload();
  // Google uses given_name and family_name
  const { email, given_name, family_name, picture } = payload;

  // check if user exists
  let user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    if (!user.isEmailVerified) {
      return next(
        new AppError(
          "Please verify your email first. Check your inbox or request a new verification link.",
          403,
        ),
      );
    }

    if (user.accountStatus !== "ACTIVE") {
      return next(
        new AppError(
          `Account is not active. Current status: ${user.accountStatus}`,
          403,
        ),
      );
    }

    const jwtToken = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Google Login successful",
      token: jwtToken,
      data: {
        user: mapUserResponse(user),
      },
    });
  } else {
    return res.status(206).json({
      success: true,
      message: "Profile completion required",
      requireProfileCompletion: true,
      googleData: {
        email: email,
        firstName: given_name,
        lastName: family_name,
        profilePic: picture,
      },
    });
  }
});

// =========================================== //
//   GOOGLE REGISTER (COMPLETE PROFILE)        //
// =========================================== //

export const googleRegister = catchAsync(async (req, res, next) => {
  const { token, role, gender, age, telephone, company } = req.body;

  if (!token || !role || !gender || !age) {
    return next(
      new AppError("Please provide token, role, gender, and age", 400),
    );
  }

  if (role === "EMPLOYER" && !company) {
    return next(
      new AppError("Company details are required for employer accounts", 400),
    );
  }

  // 1. Verify the Google token again
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return next(new AppError("Invalid Google token", 401));
  }

  const payload = ticket.getPayload();
  const { email, given_name, family_name, picture } = payload;

  // 2. Check if user already exists
  let user = await User.findOne({ email: email.toLowerCase() });

  // FIX #1: If user exists but abandoned (not Google auth and not verified), update them
  if (user && user.authProvider !== "GOOGLE" && !user.isEmailVerified) {
    // This is an abandoned account from a failed registration attempt - recover it
    user.firstName = given_name;
    user.lastName = family_name;
    user.profilePic = picture || user.profilePic;
    user.authProvider = "GOOGLE";
    user.isEmailVerified = false;
    user.accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";
    user.gender = user.gender || ""; // Keep existing if not empty
    user.age = user.age || 0; // Keep existing if not empty
    user.role = user.role || role; // Keep existing role if already set, otherwise use new role
    try {
      await sendGoogleVerificationEmail(user);
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "Error sending verification email. Please try again later.",
          500,
        ),
      );
    }
  } else if (user) {
    // User exists and is already verified - don't allow overwriting
    return next(new AppError("User already exists. Please login.", 400));
  }

  // 3. Determine Account Status
  const accountStatus = user
    ? user.role === "EMPLOYER"
      ? "PENDING"
      : "ACTIVE"
    : role === "EMPLOYER"
      ? "PENDING"
      : "ACTIVE";

  // If user didn't exist before and we're creating new, or updating abandoned account
  if (!user) {
    // Generate a random very strong password because it's required by our DB schema
    const randomPassword = crypto.randomBytes(16).toString("hex") + "A1!";

    // Create the new user
    user = await User.create({
      firstName: given_name,
      lastName: family_name,
      email: email.toLowerCase(),
      password: randomPassword,
      passwordConfirm: randomPassword,
      gender,
      role,
      age,
      telephone: telephone || [],
      accountStatus,
      authProvider: "GOOGLE", // Tag them as a Google user!
      profilePic: picture,
      isEmailVerified: false,
    });

    if (role === "EMPLOYER" && company) {
      await Employer.create({
        userId: user._id,
        company,
      });
    }

    try {
      await sendGoogleVerificationEmail(user);
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      return next(
        new AppError(
          "Error sending verification email. Please try again later.",
          500,
        ),
      );
    }
  }

  res.status(201).json({
    success: true,
    message:
      "Google registration successful. Please check your email to verify your account.",
    requiresEmailVerification: true,
    data: {
      user: mapUserResponse(user),
    },
  });
});

// =========================================== //
//   GOOGLE COMPLETE PROFILE (NO TOKEN RE-VERIFY) //
// =========================================== //

export const googleCompleteProfile = catchAsync(async (req, res, next) => {
  const { token, role, gender, age, telephone, company } = req.body;

  if (!token || !role || !gender || !age) {
    return next(
      new AppError("Please provide token, role, gender, and age", 400),
    );
  }

  if (role === "EMPLOYER" && !company) {
    return next(
      new AppError("Company details are required for employer accounts", 400),
    );
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return next(new AppError("Invalid Google token", 401));
  }

  const payload = ticket.getPayload();
  const {
    email,
    given_name: firstName,
    family_name: lastName,
    picture: profilePic,
  } = payload;

  // Check if user already exists
  let user = await User.findOne({ email: email.toLowerCase() });

  // If user exists but abandoned (not Google auth and not verified), recover them
  if (user && user.authProvider !== "GOOGLE" && !user.isEmailVerified) {
    user.firstName = firstName;
    user.lastName = lastName || "";
    user.profilePic = profilePic || user.profilePic;
    user.authProvider = "GOOGLE";
    user.isEmailVerified = false;
    user.accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";
    user.gender = gender;
    user.age = age;
    user.role = role;
    user.telephone = telephone || [];
    try {
      await sendGoogleVerificationEmail(user);
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          "Error sending verification email. Please try again later.",
          500,
        ),
      );
    }
  } else if (user) {
    return next(new AppError("User already exists. Please login.", 400));
  }

  // Determine Account Status
  const accountStatus = user
    ? user.accountStatus
    : role === "EMPLOYER"
      ? "PENDING"
      : "ACTIVE";

  // Create new user if they didn't exist
  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString("hex") + "A1!";

    user = await User.create({
      firstName,
      lastName: lastName || "",
      email: email.toLowerCase(),
      password: randomPassword,
      passwordConfirm: randomPassword,
      gender,
      role,
      age,
      telephone: telephone || [],
      accountStatus,
      authProvider: "GOOGLE",
      profilePic: profilePic || "",
      isEmailVerified: false,
    });

    if (role === "EMPLOYER" && company) {
      await Employer.create({
        userId: user._id,
        company,
      });
    }

    try {
      await sendGoogleVerificationEmail(user);
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      return next(
        new AppError(
          "Error sending verification email. Please try again later.",
          500,
        ),
      );
    }
  }

  res.status(201).json({
    success: true,
    message:
      "Google registration successful. Please check your email to verify your account.",
    requiresEmailVerification: true,
    data: {
      user: mapUserResponse(user),
    },
  });
});
