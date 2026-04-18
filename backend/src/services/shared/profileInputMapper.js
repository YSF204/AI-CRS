import { buildNormalizedProfile, extractApplicantInfoFromParsedCV } from "../../utils/profileNormalizer.js";

const parseYears = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const toEducation = (education = []) =>
    (education || []).map((entry) => ({
        institutionName: entry?.institutionName || "",
        certification: entry?.certification || "",
        durationFrom: entry?.durationFrom || "",
        durationTo: entry?.durationTo || "",
        summary: entry?.summary || "",
    }));

export const mapExistingCvToNormalizedProfile = (cvData, manualOverrides = {}) =>
    buildNormalizedProfile({
        applicantInfo: {
            fullName: manualOverrides.fullName || cvData.fullName,
            email: manualOverrides.email || cvData.contact?.email,
            phone: manualOverrides.phone || cvData.contact?.phone,
            linkedin: manualOverrides.linkedin || "",
            portfolioUrl: manualOverrides.portfolioUrl || "",
            summary: manualOverrides.summary || cvData.summary || "",
            technicalSkills: manualOverrides.technicalSkills || cvData.technicalSkills,
            softSkills: manualOverrides.softSkills || cvData.softSkills,
            languages: manualOverrides.languages || cvData.language,
            certifications: manualOverrides.certifications,
            additionalInformation: manualOverrides.additionalInformation || "",
            yearsOfExperience:
                manualOverrides.yearsOfExperience != null
                    ? parseYears(manualOverrides.yearsOfExperience)
                    : undefined,
        },
        experience: cvData.experience || [],
        education: cvData.education || [],
        customSections: cvData.customSections || [],
        cvData,
    });

export const mapParsedPdfToNormalizedProfile = ({ parsedPdfAnalysis, user, manualOverrides = {} }) => {
    const extracted = extractApplicantInfoFromParsedCV(parsedPdfAnalysis, user);

    const normalized = buildNormalizedProfile({
        applicantInfo: {
            ...extracted,
            certifications: extracted.certifications || manualOverrides.certifications || [],
        },
        experience: extracted.experience || [],
        education: extracted.education || [],
        customSections: [],
    });

    if (manualOverrides.fullName) normalized.fullName = manualOverrides.fullName;
    if (manualOverrides.email) normalized.email = manualOverrides.email;
    if (manualOverrides.phone) normalized.phone = manualOverrides.phone;
    if (manualOverrides.linkedin) normalized.linkedin = manualOverrides.linkedin;
    if (manualOverrides.portfolioUrl) normalized.portfolioUrl = manualOverrides.portfolioUrl;
    if (manualOverrides.summary) normalized.summary = manualOverrides.summary;
    if (manualOverrides.additionalInformation) {
        normalized.additionalInformation = manualOverrides.additionalInformation;
    }

    return normalized;
};

export const mapManualFormToNormalizedProfile = ({ body, user }) =>
    buildNormalizedProfile({
        applicantInfo: {
            fullName:
                body.fullName ||
                (user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Candidate"),
            email: body.email || user.email || "",
            phone: body.phone || "",
            linkedin: body.linkedin || "",
            portfolioUrl: body.portfolioUrl || "",
            summary: body.summary || "",
            technicalSkills: body.technicalSkills || [],
            softSkills: body.softSkills || [],
            languages: body.languages || [],
            yearsOfExperience: parseYears(body.yearsOfExperience),
            certifications: body.certifications || [],
            additionalInformation: body.additionalInformation || "",
        },
        education: toEducation(body.education || []),
        customSections: [],
    });

export const mapApplicantInfoFromNormalizedProfile = (normalizedProfile) => ({
    fullName: normalizedProfile.fullName,
    email: normalizedProfile.email,
    phone: normalizedProfile.phone,
    linkedin: normalizedProfile.linkedin || "",
    portfolioUrl: normalizedProfile.portfolioUrl || "",
    summary: normalizedProfile.summary,
    technicalSkills: normalizedProfile.technicalSkills,
    softSkills: normalizedProfile.softSkills,
    yearsOfExperience: normalizedProfile.yearsOfExperience,
    languages: normalizedProfile.languages,
    additionalInformation: normalizedProfile.additionalInformation || "",
    certifications: normalizedProfile.certifications,
    education: normalizedProfile.education,
});

export default {
    mapExistingCvToNormalizedProfile,
    mapParsedPdfToNormalizedProfile,
    mapManualFormToNormalizedProfile,
    mapApplicantInfoFromNormalizedProfile,
};
