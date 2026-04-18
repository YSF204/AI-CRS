import crypto from "crypto";
import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import { generateToken } from "../../../utils/generateToken.js";

export const resetUserPassword = async ({ rawToken, password, passwordConfirm }) => {
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new AppError("Token is invalid or has experied", 400);
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
