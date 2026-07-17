import crypto from "crypto";
import { createClerkClient, getAuth } from "@clerk/express";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { generateToken } from "../utils/generateToken.js";
import User from "../models/User.js";
import Employer from "../models/Employer.js";
import { mapUserResponse } from "../services/shared/userResponseMapper.js";

const ALLOWED_ROLES = new Set(["EMPLOYEE", "EMPLOYER"]);

const getClerkUser = async (req) => {
  const { isAuthenticated, userId } = getAuth(req);
  if (!isAuthenticated || !userId) {
    throw new AppError("Invalid or expired Clerk session", 401);
  }

  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    ) || clerkUser.emailAddresses[0];

  if (
    !primaryEmail?.emailAddress ||
    primaryEmail.verification?.status !== "verified"
  ) {
    throw new AppError("A verified email address is required", 403);
  }

  return {
    email: primaryEmail.emailAddress.toLowerCase(),
    firstName: clerkUser.firstName || "User",
    lastName: clerkUser.lastName || "Account",
    profilePic: clerkUser.imageUrl || "",
  };
};

const sendAppSession = (res, user, message) =>
  res.status(200).json({
    success: true,
    message,
    token: generateToken(user._id, user.role),
    data: { user: mapUserResponse(user) },
  });

export const clerkAuth = catchAsync(async (req, res) => {
  const identity = await getClerkUser(req);
  const user = await User.findOne({ email: identity.email });

  if (!user) {
    return res.status(206).json({
      success: true,
      message: "Profile completion required",
      requireProfileCompletion: true,
      clerkData: identity,
    });
  }

  if (user.accountStatus !== "ACTIVE") {
    return res.status(403).json({
      success: false,
      message: `Account is not active. Current status: ${user.accountStatus}`,
      role: user.role,
      accountStatus: user.accountStatus,
    });
  }

  user.authProvider = "CLERK";
  user.isEmailVerified = true;
  if (!user.profilePic && identity.profilePic) user.profilePic = identity.profilePic;
  await user.save({ validateModifiedOnly: true });

  return sendAppSession(res, user, "Social login successful");
});

export const clerkCompleteProfile = catchAsync(async (req, res, next) => {
  const identity = await getClerkUser(req);
  const role = String(req.body.role || "").toUpperCase();
  const gender = String(req.body.gender || "").toUpperCase();
  const age = Number(req.body.age);
  const telephone = Array.isArray(req.body.telephone) ? req.body.telephone : [];
  const company = req.body.company;

  if (!ALLOWED_ROLES.has(role)) {
    return next(new AppError("Invalid account role", 400));
  }
  if (!['MALE', 'FEMALE'].includes(gender)) {
    return next(new AppError("Invalid gender", 400));
  }
  if (!Number.isInteger(age) || age < 1 || age > 150) {
    return next(new AppError("Invalid age", 400));
  }
  if (role === "EMPLOYER" && !company) {
    return next(new AppError("Company details are required", 400));
  }

  const existingUser = await User.findOne({ email: identity.email });
  if (existingUser) {
    if (existingUser.accountStatus !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: `Account is not active. Current status: ${existingUser.accountStatus}`,
        role: existingUser.role,
        accountStatus: existingUser.accountStatus,
      });
    }
    existingUser.authProvider = "CLERK";
    existingUser.isEmailVerified = true;
    await existingUser.save({ validateModifiedOnly: true });
    return sendAppSession(res, existingUser, "Account already exists");
  }

  const generatedPassword = crypto.randomBytes(32).toString("base64url");
  let user;
  try {
    user = await User.create({
      firstName: identity.firstName,
      lastName: identity.lastName,
      email: identity.email,
      password: generatedPassword,
      passwordConfirm: generatedPassword,
      gender,
      role,
      telephone,
      age,
      authProvider: "CLERK",
      profilePic: identity.profilePic,
      accountStatus: role === "EMPLOYER" ? "PENDING" : "ACTIVE",
      isEmailVerified: true,
    });

    if (role === "EMPLOYER") {
      await Employer.create({ userId: user._id, company });
    }
  } catch (error) {
    if (user?._id) await User.deleteOne({ _id: user._id });
    throw error;
  }

  return sendAppSession(res, user, "Social account created");
});
