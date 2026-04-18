import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import { generateToken } from "../../../utils/generateToken.js";
import { mapUserResponse } from "../../shared/userResponseMapper.js";
import { verifyGoogleToken } from "./verifyGoogleToken.js";

export const googleAuthLogin = async ({ token }) => {
    const payload = await verifyGoogleToken({ token });
    const { email, given_name, family_name, picture } = payload;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
        if (user.accountStatus !== "ACTIVE") {
            throw new AppError(`Account is not active. Current status: ${user.accountStatus}`, 403);
        }

        return {
            hasExistingAccount: true,
            token: generateToken(user._id),
            user: mapUserResponse(user),
        };
    }

    return {
        hasExistingAccount: false,
        googleData: {
            email,
            firstName: given_name,
            lastName: family_name,
            profilePic: picture,
        },
    };
};

export default googleAuthLogin;
