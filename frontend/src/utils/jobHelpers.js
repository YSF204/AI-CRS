import { getRelativeTime } from "./dateFormatter";

export const toRoleType = (value) => {
  if (value === "FULL_TIME") return "Full-time";
  if (value === "PART_TIME") return "Part-time";
  if (value === "CONTRACT") return "Contract";
  if (value === "INTERNSHIP") return "Internship";
  return value || "Open";
};

export const normalizeJob = (job, index = 0) => ({
  id: job._id || job.id || job.externalUrl || job.url || `job-${index}`,
  title: job.position || job.title,
  company:
    job.employerId?.company?.name ||
    job.sourceName ||
    job.company ||
    "Company",
  location: job.workSite?.replace("_", " ") || job.location || "N/A",
  type: toRoleType(job.workDuration),
  posted: job.createdAt
    ? getRelativeTime(job.createdAt)
    : job.posted || "Recently",
  externalUrl: job.externalUrl || job.url || "",
  sourceName: job.sourceName || "",
  raw: job,
});

export const normalizeCvMatch = (item, index) => {
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
    type: item.workDuration ? toRoleType(item.workDuration) : "Open",
    posted: item.createdAt ? getRelativeTime(item.createdAt) : "Recently",
    externalUrl: item.externalUrl || "",
    sourceName: item.sourceName || "",
    isExternal: !!item.isExternal,
    raw: item,
  };
};

export const sortJobs = (jobs, sortBy) => {
  const sorted = [...jobs];

  switch (sortBy) {
    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.raw?.createdAt || 0).getTime() -
          new Date(b.raw?.createdAt || 0).getTime(),
      );
    case "salary_desc":
      return sorted.sort(
        (a, b) => (b.raw?.salary || 0) - (a.raw?.salary || 0),
      );
    case "salary_asc":
      return sorted.sort(
        (a, b) => (a.raw?.salary || 0) - (b.raw?.salary || 0),
      );
    case "relevance":
      return sorted.sort((a, b) => (b.match || 0) - (a.match || 0));
    case "newest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.raw?.createdAt || 0).getTime() -
          new Date(a.raw?.createdAt || 0).getTime(),
      );
  }
};
