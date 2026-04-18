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

export default formatCandidateCvBlock;
