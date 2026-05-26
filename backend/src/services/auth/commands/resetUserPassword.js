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
        throw new AppError("Token is invalid or has expired", 400);
    }

    // Check if new password is the same as the current password
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
        throw new AppError(
            "You already use this password — please choose a different one for your reset",
            400,
        );
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // FIX: pass user.role so the token carries the correct role claim
    return {
        token: generateToken(user._id, user.role),
    };
};

export default resetUserPassword;
