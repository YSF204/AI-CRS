import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import { generateToken } from "../../../utils/generateToken.js";
import { mapUserResponse } from "../../shared/userResponseMapper.js";

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    if (user.accountStatus !== "ACTIVE") {
        throw new AppError(`Account is not active. Current status: ${user.accountStatus}`, 403);
    }

    const isPasswordValid = await user.comparePassword(String(password));
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    return {
        token: generateToken(user._id),
        user: mapUserResponse(user),
    };
};

export default loginUser;
