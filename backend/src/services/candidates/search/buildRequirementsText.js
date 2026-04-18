export const buildRequirementsText = (body) => {
    const {
        position,
        description,
        technicalSkills = [],
        softSkills = [],
        yearsOfExperience,
        language = [],
        additionalNotes,
    } = body;

    return [
        `Position: ${position}`,
        description ? `Description: ${description}` : null,
        technicalSkills.length ? `Required Technical Skills: ${technicalSkills.join(", ")}` : null,
        softSkills.length ? `Required Soft Skills: ${softSkills.join(", ")}` : null,
        yearsOfExperience != null ? `Years of Experience: ${yearsOfExperience}` : null,
        language.length ? `Languages: ${language.join(", ")}` : null,
        additionalNotes ? `Notes: ${additionalNotes}` : null,
    ]
        .filter(Boolean)
        .join("\n");
};

export default buildRequirementsText;
