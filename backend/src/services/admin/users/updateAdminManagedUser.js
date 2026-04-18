import User from "../../../models/User.js";
import Employer from "../../../models/Employer.js";
import AppError from "../../../utils/appError.js";
import sendEmail from "../../../utils/email.js";
import {
    buildAdminUpdateAccountEmail,
} from "../../shared/emailTemplateService.js";
import {
    findEmployerProfileByUserId,
    recoverEmployerProfileFromLegacyUserData,
} from "../../shared/employerProfileService.js";
import { buildUserChangeList, addCompanyChanges } from "./trackUserChanges.js";

const hasMeaningfulValue = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value === null || value === undefined) return false;
    return String(value).trim().length > 0;
};

export const updateAdminManagedUser = async ({ userId, body }) => {
    const {
        firstName,
        lastName,
        email,
        gender,
        role,
        telephone,
        age,
        accountStatus,
        company,
        password,
        passwordConfirm,
    } = body;

    const validRoles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
    const validGenders = ["MALE", "FEMALE"];

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    let existingEmployer = await findEmployerProfileByUserId(userId);
    if (user.role === "EMPLOYER" && !existingEmployer) {
        existingEmployer = await recoverEmployerProfileFromLegacyUserData(userId);
    }

    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email.toLowerCase();

    if (gender !== undefined) {
        if (!validGenders.includes(gender.toUpperCase())) {
            throw new AppError("Invalid gender. Gender must be MALE or FEMALE", 400);
        }
        updates.gender = gender.toUpperCase();
    }

    if (role !== undefined) {
        if (!validRoles.includes(role.toUpperCase())) {
            throw new AppError("Invalid role. Role must be EMPLOYEE, EMPLOYER, or ADMIN", 400);
        }
        updates.role = role.toUpperCase();
    }

    if (telephone !== undefined) updates.telephone = telephone || [];
    if (age !== undefined) updates.age = Number(age);
    if (accountStatus !== undefined) updates.accountStatus = accountStatus;

    let updatedUser;
    let includePasswordChange = false;

    if (password || passwordConfirm) {
        if (!password || !passwordConfirm) {
            throw new AppError("To update password, both password and passwordConfirm are required", 400);
        }
        if (password !== passwordConfirm) {
            throw new AppError("Passwords do not match", 400);
        }

        Object.assign(user, updates);
        user.password = password;
        user.passwordConfirm = passwordConfirm;
        await user.save();
        includePasswordChange = true;

        updatedUser = await User.findById(userId).select(
            "-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires",
        );
    } else {
        updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires");
    }

    let updatedEmployer = null;
    const isEmployerTarget = updates.role === "EMPLOYER" || user.role === "EMPLOYER";
    const companyPayloadProvided =
        company &&
        (hasMeaningfulValue(company.name) ||
            hasMeaningfulValue(company.license) ||
            hasMeaningfulValue(company.contactEmail) ||
            hasMeaningfulValue(company.website) ||
            (Array.isArray(company.branches) &&
                company.branches.some(
                    (branch) =>
                        hasMeaningfulValue(branch?.name) ||
                        hasMeaningfulValue(branch?.city) ||
                        hasMeaningfulValue(branch?.street),
                )));

    if (isEmployerTarget && companyPayloadProvided) {
        const mergedCompany = {
            name: company.name ?? existingEmployer?.company?.name,
            license: company.license ?? existingEmployer?.company?.license,
            contactEmail: company.contactEmail ?? existingEmployer?.company?.contactEmail,
            website: company.website !== undefined ? company.website : existingEmployer?.company?.website,
            branches: company.branches !== undefined ? company.branches : existingEmployer?.company?.branches,
        };

        if (existingEmployer) {
            updatedEmployer = await Employer.findByIdAndUpdate(
                existingEmployer._id,
                { company: mergedCompany },
                { new: true, runValidators: true },
            );
        } else {
            updatedEmployer = await Employer.create({ userId, company: mergedCompany });
        }
    }

    const changes = buildUserChangeList({
        previousUser: user,
        updatedUser,
        includePasswordChange,
    });

    if (existingEmployer || updatedEmployer) {
        addCompanyChanges({
            changes,
            previousCompany: existingEmployer?.company || {},
            updatedCompany: updatedEmployer?.company || {},
        });
    }

    try {
        const emailTemplate = buildAdminUpdateAccountEmail(updatedUser, changes);
        await sendEmail({
            email: updatedUser.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: `Hello ${updatedUser.firstName}, your account was updated by an administrator.`,
        });
    } catch (_error) {
        // best effort
    }

    return { user: updatedUser, employer: updatedEmployer };
};

export default updateAdminManagedUser;
