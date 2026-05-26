function getRelativeTime(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

const toRoleType = (value) => {
  if (value === "FULL_TIME") return "Full-time";
  if (value === "PART_TIME") return "Part-time";
  if (value === "CONTRACT") return "Contract";
  if (value === "INTERNSHIP") return "Internship";
  return value || "Open";
};

export const normalizeJob = (job) => {
  if (!job) return null;

  return {
    id: job._id || job.id,
    title: job.position || job.jobTitle || job.title || "Job Position",
    company: job.employerId?.company?.name || job.company || job.sourceName || "Company",
    location: job.workSite?.replace("_", " ") || job.location || "N/A",
    type: toRoleType(job.workDuration),
    posted: job.createdAt ? getRelativeTime(job.createdAt) : (job.posted || "Recently"),
    salary: job.salary,
    externalUrl: job.externalUrl || job.url || "",
    sourceName: job.sourceName || "",
    raw: job,
  };
};

export const normalizeJobs = (jobs) => {
  if (!Array.isArray(jobs)) return [];
  return jobs.map(normalizeJob).filter(Boolean);
};

export const normalizeCvJobMatch = (item, index) => {
  if (!item) return null;

  const rawId = item.jobId || item.job_id || item._id || item.id;
  const id = typeof rawId === "object" ? rawId?._id : rawId;
  const score = item.matchScore ?? item.relevance_score ?? item.relevanceScore;

  return {
    key: id || index,
    id,
    title: item.position || item.jobTitle || item.title || "Matched Job",
    location: item.workSite || item.location || "Location not available",
    company: item.company || item.companyName || "Company",
    match: Number.isFinite(Number(score)) ? Number(score) : null,
    reasoning: item.reasoning || item.recommendation_note,
    skillsMatched: item.skillsMatched || item.match_reasons || [],
    skillsMissing: item.skillsMissing || item.missing_skills || [],
    type: item.workDuration ? toRoleType(item.workDuration) : "Full-time",
    posted: item.createdAt ? getRelativeTime(item.createdAt) : "Recently",
    salary: item.salary,
    raw: item,
  };
};

export const normalizeCvJobMatches = (jobs) => {
  if (!jobs) return [];
  const items = Array.isArray(jobs) ? jobs : [jobs];
  return items
    .map(normalizeCvJobMatch)
    .filter(Boolean)
    .sort((a, b) => (b.match ?? -1) - (a.match ?? -1));
};
