import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Employer from "../models/Employer.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

  // FIX #1: If user exists but abandoned (not Google auth and not verified), recover them
  if (user && user.authProvider !== "GOOGLE" && !user.isEmailVerified) {
    // This is an abandoned account from a failed registration attempt - update it
    user.authProvider = "GOOGLE";
    user.isEmailVerified = true;
    user.accountStatus = "ACTIVE";
    user.profilePic = picture || user.profilePic;
    await user.save({ validateBeforeSave: false });
  }

  if (user) {
    if (user.accountStatus !== "ACTIVE") {
      return next(
        new AppError(
          `Account is not active. Current status: ${user.accountStatus}`,
          403,
        ),
      );
    }

    const jwtToken = generateToken(user._id, user.role);

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
      profilePic: user.profilePic,
      isEmailVerified: user.isEmailVerified,
    };

    return res.status(200).json({
      success: true,
      message: "Google Login successful",
      token: jwtToken,
      data: {
        user: userResponse,
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
    user.isEmailVerified = true;
    user.accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";
    user.gender = user.gender || ""; // Keep existing if not empty
    user.age = user.age || 0; // Keep existing if not empty
    user.role = user.role || role; // Keep existing role if already set, otherwise use new role
    await user.save({ validateBeforeSave: false });
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
      // FIX #1: Google users have verified emails
      isEmailVerified: true,
    });

    if (role === "EMPLOYER" && company) {
      await Employer.create({
        userId: user._id,
        company,
      });
    }
  }

  // 6. Generate backend auth token
  const jwtToken = generateToken(user._id, user.role);

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
    profilePic: user.profilePic,
  };

  res.status(201).json({
    success: true,
    message: "Google Registration successful",
    token: jwtToken,
    data: {
      user: userResponse,
    },
  });
});

// =========================================== //
//   GOOGLE COMPLETE PROFILE (NO TOKEN RE-VERIFY) //
// =========================================== //

export const googleCompleteProfile = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, profilePic, role, gender, age, telephone, company } = req.body;

  if (!email || !firstName || !role || !gender || !age) {
    return next(
      new AppError("Please provide email, firstName, role, gender, and age", 400),
    );
  }

  if (role === "EMPLOYER" && !company) {
    return next(
      new AppError("Company details are required for employer accounts", 400),
    );
  }

  // Check if user already exists
  let user = await User.findOne({ email: email.toLowerCase() });

  // If user exists but abandoned (not Google auth and not verified), recover them
  if (user && user.authProvider !== "GOOGLE" && !user.isEmailVerified) {
    user.firstName = firstName;
    user.lastName = lastName || "";
    user.profilePic = profilePic || user.profilePic;
    user.authProvider = "GOOGLE";
    user.isEmailVerified = true;
    user.accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";
    user.gender = gender;
    user.age = age;
    user.role = role;
    user.telephone = telephone || [];
    await user.save({ validateBeforeSave: false });
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
      isEmailVerified: true,
    });

    if (role === "EMPLOYER" && company) {
      await Employer.create({
        userId: user._id,
        company,
      });
    }
  }

  const jwtToken = generateToken(user._id, user.role);

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
    profilePic: user.profilePic,
  };

  res.status(201).json({
    success: true,
    message: "Google Registration successful",
    token: jwtToken,
    data: {
      user: userResponse,
    },
  });
});
