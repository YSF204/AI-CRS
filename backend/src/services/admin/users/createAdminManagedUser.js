import User from "../../../models/User.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";
import sendEmail from "../../../utils/email.js";
import { buildAdminCreateAccountEmail } from "../../shared/emailTemplateService.js";
import { mapUserResponse } from "../../shared/userResponseMapper.js";

export const createAdminManagedUser = async ({ body }) => {
    const {
        firstName,
        lastName,
        email,
        password,
        passwordConfirm,
        gender,
        role,
        telephone,
        age,
        company,
    } = body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !passwordConfirm ||
        !gender ||
        !role ||
        age === undefined
    ) {
        throw new AppError("Please provide all required fields", 400);
    }

    const validRoles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
    const validGenders = ["MALE", "FEMALE"];

    if (!validRoles.includes(role.toUpperCase())) {
        throw new AppError("Invalid role. Role must be EMPLOYEE, EMPLOYER, or ADMIN", 400);
    }

    if (!validGenders.includes(gender.toUpperCase())) {
        throw new AppError("Invalid gender. Gender must be MALE or FEMALE", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new AppError("User with this email already exists", 400);
    }

    const accountStatus = role.toUpperCase() === "EMPLOYER" ? "PENDING" : "ACTIVE";

    const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        passwordConfirm,
        gender: gender.toUpperCase(),
        role: role.toUpperCase(),
        telephone: telephone || [],
        age,
        accountStatus,
    });

    let employer = null;
    if (role.toUpperCase() === "EMPLOYER" && company) {
        employer = await Employer.create({ userId: user._id, company });
    }

    try {
        const emailTemplate = buildAdminCreateAccountEmail(user);
        await sendEmail({
            email: user.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: `Hello ${user.firstName}, your account has been created by an administrator.`,
        });
    } catch (_error) {
        // best effort
    }

    return {
        user: {
            ...mapUserResponse(user),
            createdAt: user.createdAt,
        },
        employer,
    };
};

export default createAdminManagedUser;
