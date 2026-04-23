import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import { generateToken } from "../../../utils/generateToken.js";

export const updateUserPassword = async ({
  userId,
  currentPassword,
  password,
  passwordConfirm,
}) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("This user does not exist", 400);
  }

  const isCurrentPasswordValid = await user.comparePassword(
    String(currentPassword),
  );
  if (!isCurrentPasswordValid) {
    throw new AppError("You're current password is wrong ", 401);
  }

  // FIX #6: Verify new password is different from current password
  const isSamePassword = await user.comparePassword(String(password));
  if (isSamePassword) {
    throw new AppError(
      "New password must be different from your current password",
      400,
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  return {
    token: generateToken(user._id),
  };
};

export default updateUserPassword;
