export const formatCandidateCvBlock = (cv) =>
    [
        `=== CANDIDATEID ${cv._id} ===`,
        `job title: ${cv.jobTitle || "N/A"}`,
        `summary: ${cv.summary || "N/A"}`,
        `Email: ${cv.contact?.email || "N/A"}`,
        `Phone: ${cv.contact?.phone || "N/A"}`,
        `GitHub: ${cv.contact?.github || "N/A"}`,
        `LinkedIn: ${cv.contact?.linkedin || "N/A"}`,
        `Location: ${[cv.address?.city, cv.address?.street].filter(Boolean).join(", ") || "N/A"}`,
        `Technical Skills: ${cv.technicalSkills?.join(", ") || "N/A"}`,
        `Soft Skills: ${cv.softSkills?.join(", ") || "N/A"}`,
        `Languages: ${cv.language?.join(", ") || "N/A"}`,
        `Experience: ${cv.experience?.length
            ? cv.experience
                .map(
                    (entry) =>
                        `${entry.position} at ${entry.institutionName} (${entry.duration || 0}y)${entry.summary ? ` - ${entry.summary}` : ""}`,
                )
                .join(" | ")
            : "None"
        }`,
        `Education: ${cv.education?.length
            ? cv.education
                .map(
                    (entry) =>
                        `${entry.certification} at ${entry.institutionName} (${entry.duration || 0}y)${entry.summary ? ` - ${entry.summary}` : ""}`,
                )
                .join(" | ")
            : "None"
        }`,
    ].join("\n");

export const normalizeApplicationToCvLike = (app) => {
    const cv = app.cvId && typeof app.cvId === "object" ? app.cvId : null;
    const info = app.applicantInfo || {};

    return {
        _id: app._id,
        jobTitle: cv?.jobTitle || null,
        summary: cv?.summary || info.summary || null,
        contact: {
            email: cv?.contact?.email || info.email || null,
            phone: cv?.contact?.phone || info.phone || null,
            github: cv?.contact?.github || null,
            linkedin: cv?.contact?.linkedin || info.linkedin || null,
        },
        address: cv?.address || null,
        technicalSkills: cv?.technicalSkills || info.technicalSkills || [],
        softSkills: cv?.softSkills || info.softSkills || [],
        language: cv?.language || info.languages || [],
        experience: cv?.experience || [],
        education: cv?.education || info.education || [],
    };
};

export default formatCandidateCvBlock;
