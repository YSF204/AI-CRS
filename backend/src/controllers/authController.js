import catchAsync from "../utils/catchAsync.js";
import { signupSchema, loginSchema } from "../schema/auth.schema.js";
import AppError from "./../utils/appError.js";
import { registerUser } from "../services/auth/commands/registerUser.js";
import { loginUser } from "../services/auth/commands/loginUser.js";
import { getCurrentUserProfile } from "../services/auth/queries/getCurrentUserProfile.js";
import { sendPasswordResetEmail } from "../services/auth/commands/sendPasswordResetEmail.js";
import { resetUserPassword } from "../services/auth/commands/resetUserPassword.js";
import { updateUserPassword } from "../services/auth/commands/updateUserPassword.js";

// ================================== //
//       REGISTER NEW USER            //
// ================================== //

export const register = catchAsync(async (req, res, next) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors.map((err) => err.message).join(", ");
    return next(new AppError(message, 400));
  }

  const resultData = await registerUser({ payload: result.data });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: resultData.token,
    data: {
      user: resultData.user,
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

  const resultData = await loginUser(result.data);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: resultData.token,
    data: {
      user: resultData.user,
    },
  });
});

// ================================== //
//       GET CURRENT LOGGED IN USER   //
// ================================== //

export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await getCurrentUserProfile({ userId: req.user._id });

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
  await sendPasswordResetEmail({
    email: req.body.email,
    protocol: req.protocol,
    host: req.get("host"),
  });

  res.status(200).json({
    status: "success",
    message: "Token has been sent to email",
  });
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
