import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import {
    findEmployerProfileByUserId,
    recoverEmployerProfileFromLegacyUserData,
} from "../../shared/employerProfileService.js";

export const getAdminUserById = async ({ userId }) => {
    const user = await User.findById(userId).select(
        "-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires",
    );

    if (!user) {
        throw new AppError("User not found", 404);
    }

    let employer = user.role === "EMPLOYER" ? await findEmployerProfileByUserId(userId) : null;

    if (user.role === "EMPLOYER" && !employer) {
        employer = await recoverEmployerProfileFromLegacyUserData(userId);
    }

    return { user, employer };
};

export default getAdminUserById;
