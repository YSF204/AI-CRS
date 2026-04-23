import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import { generateToken } from "../../../utils/generateToken.js";

export const resetUserPassword = async ({ rawToken, password, passwordConfirm }) => {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
        throw new AppError("Token is invalid or has experied", 400);
    }

    // Check if new password is the same as the current password
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
        throw new AppError(
            "You can use this password to log in — please choose a different one for your reset",
            400,
        );
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return {
        token: generateToken(user._id),
    };
};

export default resetUserPassword;
