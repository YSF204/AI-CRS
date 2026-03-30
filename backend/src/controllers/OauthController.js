import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Employer from "../models/Employer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// Google client id 
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
            audience: process.env.GOOGLE_CLIENT_ID
        });
    } catch (error) {
        return next(new AppError("Invalid Google token", 401));
    }

    const payload = ticket.getPayload();
    // Google uses given_name and family_name
    const { email, given_name, family_name, picture } = payload;

    // check if user exists 
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
        if (user.accountStatus !== "ACTIVE") {
            return next(
                new AppError(
                    `Account is not active. Current status: ${user.accountStatus}`,
                    403
                )
            );
        }

        const jwtToken = generateToken(user._id);

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
    return next(new AppError("Please provide token, role, gender, and age", 400));
  }

  if (role === "EMPLOYER" && !company) {
    return next(new AppError("Company details are required for employer accounts", 400));
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

  // 2. Check if user already exists (maybe they double-clicked or something)
  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    return next(new AppError("User already exists. Please login.", 400));
  }

  // 3. Determine Account Status
  const accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";

  // 4. Generate a random very strong password because it's required by our DB schema
  const randomPassword = crypto.randomBytes(16).toString("hex") + "A1!";

  // 5. Create the new user
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
  });

  if (role === "EMPLOYER" && company) {
    await Employer.create({
      userId: user._id,
      company,
    });
  }

  // 6. Generate backend auth token
  const jwtToken = generateToken(user._id);

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
