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

export default mapRankedCandidates;
