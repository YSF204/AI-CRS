const MAX_CANDIDATES = 20;

export const mapRankedCandidates = (allCvs, ranked) => {
    const cvMap = new Map(allCvs.map((cv) => [String(cv._id), cv]));

    return (ranked || [])
        .map((item) => {
            const cv = cvMap.get(String(item.cvId || ""));
            if (!cv) {
                return null;
            }

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
                    name: cv.userId ? `${cv.userId.firstName} ${cv.userId.lastName}` : "Unknown",
                    email: cv.userId?.email,
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
