import mongoose from "mongoose";
import Employer from "../../models/Employer.js";
import User from "../../models/User.js";

const normalizeId = (userId) =>
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

export const findEmployerProfileByUserId = async (userId) => {
    const normalizedId = normalizeId(userId);

    const employer = await Employer.findOne({ userId: normalizedId });
    if (employer) return employer;

    const legacyRecord = await Employer.collection.findOne({ user: normalizedId });
    if (!legacyRecord) return null;

    return Employer.hydrate(legacyRecord);
};

export const recoverEmployerProfileFromLegacyUserData = async (userId) => {
    const normalizedId = normalizeId(userId);

    const rawUser = await User.collection.findOne(
        { _id: normalizedId },
        { projection: { company: 1 } },
    );

    const legacyCompany = rawUser?.company;
    const hasCompanyData =
        legacyCompany &&
        typeof legacyCompany === "object" &&
        (legacyCompany.name ||
            legacyCompany.license ||
            legacyCompany.contactEmail ||
            (Array.isArray(legacyCompany.branches) && legacyCompany.branches.length > 0));

    if (!hasCompanyData) return null;

    return Employer.create({
        userId: normalizedId,
        company: legacyCompany,
    });
};

export default {
    findEmployerProfileByUserId,
    recoverEmployerProfileFromLegacyUserData,
};
