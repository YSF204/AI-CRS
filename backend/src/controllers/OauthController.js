import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { googleAuthLogin } from "../services/auth/oauth/googleAuthLogin.js";
import { googleRegisterUser } from "../services/auth/oauth/googleRegisterUser.js";

// Google auth 
export const googleAuth = catchAsync(async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(new AppError("Google token is required", 400));
  }

  const result = await googleAuthLogin({ token });

  if (result.hasExistingAccount) {
    return res.status(200).json({
      success: true,
      message: "Google Login successful",
      token: result.token,
      data: {
        user: result.user,
      },
    });
  }

  return res.status(206).json({
    success: true,
    message: "Profile completion required",
    requireProfileCompletion: true,
    googleData: result.googleData,
  });
});

// =========================================== //
//   GOOGLE REGISTER (COMPLETE PROFILE)        //
// =========================================== //

export const googleRegister = catchAsync(async (req, res, next) => {
  const result = await googleRegisterUser({ body: req.body });

  res.status(201).json({
    success: true,
    message: "Google Registration successful",
    token: result.token,
    data: {
      user: result.user,
    },
  });
});
