import crypto from "crypto";
import User from "../../../models/User.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";
import { generateToken } from "../../../utils/generateToken.js";
import { mapUserResponse } from "../../shared/userResponseMapper.js";
import { verifyGoogleToken } from "./verifyGoogleToken.js";

export const googleRegisterUser = async ({ body }) => {
    const { token, role, gender, age, telephone, company } = body;

    if (!token || !role || !gender || !age) {
        throw new AppError("Please provide token, role, gender, and age", 400);
    }

    if (role === "EMPLOYER" && !company) {
        throw new AppError("Company details are required for employer accounts", 400);
    }

    const payload = await verifyGoogleToken({ token });
    const { email, given_name, family_name, picture } = payload;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new AppError("User already exists. Please login.", 400);
    }

    const accountStatus = role === "EMPLOYER" ? "PENDING" : "ACTIVE";
    const randomPassword = `${crypto.randomBytes(16).toString("hex")}A1!`;

    const user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email: email.toLowerCase(),
        password: randomPassword,
        passwordConfirm: randomPassword,
        gender,
        role,
        age,
        telephone: telephone || [],
        accountStatus,
        authProvider: "GOOGLE",
        profilePic: picture,
    });

    if (role === "EMPLOYER" && company) {
        await Employer.create({ userId: user._id, company });
    }

    return {
        token: generateToken(user._id),
        user: mapUserResponse(user),
    };
};

export default googleRegisterUser;
