const MAX_CANDIDATES = 20;

export const mapRankedCandidates = (allCvs, ranked) => {
    const cvMap = new Map(allCvs.map((cv) => [String(cv._id), cv]));

    const getCandidateName = (cv) => {
        const fullName = typeof cv.fullName === "string" ? cv.fullName.trim() : "";
        if (fullName) return fullName;

        const user = cv.userId;
        if (user && typeof user === "object") {
            const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
            if (name) return name;
        }

        return "";
    };

    return (ranked || [])
        .map((item) => {
            const cv = cvMap.get(String(item.cvId || ""));
            if (!cv) {
                return null;
            }

            const contact = {
                email: cv.contact?.email || cv.userId?.email || "",
                phone: cv.contact?.phone || "",
                github: cv.contact?.github || "",
                linkedin: cv.contact?.linkedin || "",
            };

            return {
                cvId: cv._id,
                userId: cv.userId?._id,
                rank: item.rank,
                matchScore: item.matchScore,
                reasoning: item.reasoning,
                strengths: Array.isArray(item.strengths)
                    ? item.strengths
                    : item.strengths
                        ? [item.strengths]
                        : [],
                skillsMatched: item.skillsMatched || [],
                skillsMissing: item.skillsMissing || [],
                profile: {
                    name: getCandidateName(cv),
                    email: contact.email,
                    contact,
                    jobTitle: cv.jobTitle,
                    summary: cv.summary,
                    technicalSkills: cv.technicalSkills,
                    experience: cv.experience,
                    education: cv.education,
                },
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, MAX_CANDIDATES);
};

export const mapRankedApplications = (applications, ranked) => {
    const appMap = new Map(applications.map((app) => [String(app._id), app]));

    return (ranked || [])
        .map((item) => {
            const app = appMap.get(String(item.cvId || ""));
            if (!app) return null;

            const cv = app.cvId && typeof app.cvId === "object" ? app.cvId : null;
            const info = app.applicantInfo || {};
            const user = app.userId && typeof app.userId === "object" ? app.userId : null;

            const name = user
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || info.fullName || "Unknown"
                : info.fullName || "Unknown";

            return {
                applicationId: app._id,
                cvId: cv ? cv._id : null,
                userId: user?._id || app.userId,
                rank: item.rank,
                matchScore: item.matchScore,
                reasoning: item.reasoning,
                strengths: Array.isArray(item.strengths)
                    ? item.strengths
                    : item.strengths
                        ? [item.strengths]
                        : [],
                skillsMatched: item.skillsMatched || [],
                skillsMissing: item.skillsMissing || [],
                profile: {
                    name,
                    email: user?.email || info.email || null,
                    jobTitle: cv?.jobTitle || null,
                    summary: cv?.summary || info.summary || null,
                    technicalSkills: cv?.technicalSkills || info.technicalSkills || [],
                    experience: cv?.experience || [],
                    education: cv?.education || info.education || [],
                },
            };
        })
        .filter(Boolean)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, MAX_CANDIDATES);
};

export default mapRankedCandidates;
