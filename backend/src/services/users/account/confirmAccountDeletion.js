import crypto from "crypto";
import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";

export const confirmAccountDeletion = async (token) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        deleteToken: hashedToken,
        deleteTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new AppError("Token is invalid or expired", 400);
    }

    user.active = false;
    user.deleteToken = undefined;
    user.deleteTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return { deactivated: true };
};

export default confirmAccountDeletion;
