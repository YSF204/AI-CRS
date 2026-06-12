import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// ================================== //
//    AUTH USING JWT TOKEN MIDDLEWARE //
// ================================== //

export const authenticate = catchAsync(async (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("You're not logged in", 401));
  }

  const token = authHeader.split(" ")[1];

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Find the user this token belongs to
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401),
    );
  }

  // Reject if the password was changed after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password — please log in again", 401),
    );
  }

  // A deactivated or pending user's existing JWT must not grant access.
  if (user.accountStatus !== "ACTIVE") {
    return next(
      new AppError(
        `Account is not active (status: ${user.accountStatus}). Please contact support.`,
        403,
      ),
    );
  }

  // FIX: Reject tokens for accounts whose email is not verified.
  // Older tokens issued before email verification was enforced must not bypass it.
  if (!user.isEmailVerified) {
    return next(
      new AppError(
        "Please verify your email before making this request.",
        403,
      ),
    );
  }

  req.user = user;
  next();
});
