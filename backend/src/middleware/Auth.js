import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

// ================================== //
//    AUTH USING JWT TOKEN MIDDLEWARE //
// ================================== //

export const authenticate = catchAsync(async (req, res, next) => {
  // we get the token from the authorization header

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("You're not logged in", 401));
  }
  // extrating the token from the header
  const token = authHeader.split(" ")[1];

  // veryifying the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // finding the user by id from the token
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(
      new AppError("The user belonging to this token is no longer exist", 401),
    );
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password please log in again", 401),
    );
  }

  req.user = user;
  next();
});
