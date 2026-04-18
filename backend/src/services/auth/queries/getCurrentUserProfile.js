import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";

export const getCurrentUserProfile = async ({ userId }) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new AppError("User not Found", 404);
    }

    return user;
};

export default getCurrentUserProfile;
