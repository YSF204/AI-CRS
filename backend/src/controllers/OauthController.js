import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Employer from "../models/Employer.js";

let cachedClient = null;
const getGoogleClient = () => {
  if (!cachedClient) {
    cachedClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return cachedClient;
};

// Google auth
export const googleAuth = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  if (!token) return next(new AppError("Google token is required", 400));

  let ticket;
  try {
    ticket = await getGoogleClient().verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return next(new AppError("Invalid Google token", 401));
  }

  const payload = ticket.getPayload();
  const { email, given_name, family_name, picture } = payload;

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user && user.authProvider !== "GOOGLE" && !user.isEmailVerified) {
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

  let ticket;
  try {
    ticket = await getGoogleClient().verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    return next(new AppError("Invalid Google token", 401));
  }

  const payload = ticket.getPayload();
  const { email, given_name, family_name, picture } = payload;

  let user = await User.findOne({ email: email.toLowerCase() });

  if (user && user.authProvider !== "GOOGLE" && !user.isEmailVerified) {
    user.firstName = given_name;
    user.lastName = family_name;
    user.profilePic = picture || user.profilePic;
    user.authProvider = "GOOGLE";
    user.isEmailVerified = true;
    user.accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";
    user.gender = user.gender || "";
    user.age = user.age || 0;
    user.role = user.role || role;
    await user.save({ validateBeforeSave: false });
  } else if (user) {
    return next(new AppError("User already exists. Please login.", 400));
  }

  const accountStatus = user
    ? user.role === "EMPLOYER"
      ? "PENDING"
      : "ACTIVE"
    : role === "EMPLOYER"
      ? "PENDING"
      : "ACTIVE";

  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString("hex") + "A1!";

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
      authProvider: "GOOGLE",
      profilePic: picture,
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

  let user = await User.findOne({ email: email.toLowerCase() });

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

  const accountStatus = user
    ? user.accountStatus
    : role === "EMPLOYER"
      ? "PENDING"
      : "ACTIVE";

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