import User from "../../../models/User.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";
import { generateToken } from "../../../utils/generateToken.js";
import { mapUserResponse } from "../../shared/userResponseMapper.js";

export const registerUser = async ({ payload }) => {
    const {
        firstName,
        lastName,
        email,
        password,
        gender,
        role,
        telephone,
        age,
        passwordConfirm,
        company,
    } = payload;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new AppError("User with this email already exists", 400);
    }

    const accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
        gender,
        role,
        telephone: telephone || [],
        age,
        accountStatus,
    });

    if (role === "EMPLOYER" && company) {
        await Employer.create({ userId: user._id, company });
    }

    return {
        token: generateToken(user._id),
        user: mapUserResponse(user),
    };
};

export default registerUser;
