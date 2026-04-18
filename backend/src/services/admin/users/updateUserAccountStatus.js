import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";

export const updateUserAccountStatus = async ({ userId, accountStatus }) => {
    const validStatuses = ["ACTIVE", "INACTIVE", "PENDING"];
    if (!accountStatus || !validStatuses.includes(accountStatus)) {
        throw new AppError(
            `accountStatus must be one of: ${validStatuses.join(", ")}`,
            400,
        );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        throw new AppError("User not found", 404);
    }

    if (targetUser.role === "ADMIN") {
        throw new AppError("Cannot modify the status of another admin", 403);
    }

    return User.findByIdAndUpdate(
        userId,
        { accountStatus },
        { new: true, runValidators: true },
    ).select("-password");
};

export default updateUserAccountStatus;
