import CV from "../../../models/CV.js";

export const createCv = async ({ userId, payload }) => {
    const {
        fullName,
        jobTitle,
        summary,
        contact,
        address,
        experience,
        education,
        language,
        softSkills,
        technicalSkills,
        customSections,
        layout,
        templateId,
        profileImage,
    } = payload;

    return CV.create({
        userId,
        fullName: fullName || "",
        jobTitle,
        summary: summary || "",
        contact: contact || {},
        address: address || {},
        experience: experience || [],
        education: education || [],
        language: language || [],
        softSkills: softSkills || [],
        technicalSkills: technicalSkills || [],
        customSections: customSections || [],
        templateId: templateId || 1,
        profileImage: profileImage || "",
        layout: {
            sectionOrder: layout?.sectionOrder || [],
            visibleSections: layout?.visibleSections || {},
        },
    });
};

export default createCv;
