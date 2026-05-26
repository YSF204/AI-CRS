import Employer from "../../../models/Employer.js";
import Job from "../../../models/Job.js";
import Application from "../../../models/Application.js";

const DAY_MS = 86400000;
const PENDING_THRESHOLD_DAYS = 7;

function weekLabel(date) {
  const m = date.toLocaleString("default", { month: "short" });
  const d = date.getDate();
  return `${m} ${d}`;
}

function bucketByWeek(items, since, dateField = "createdAt") {
  const weeks = [];
  const cursor = new Date(since);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));

  const now = new Date();
  while (cursor <= now) {
    const end = new Date(cursor);
    end.setDate(end.getDate() + 7);
    weeks.push({ start: new Date(cursor), end, label: weekLabel(cursor) });
    cursor.setDate(cursor.getDate() + 7);
  }

  const counts = weeks.map(() => 0);
  items.forEach((item) => {
    const d = new Date(item[dateField]);
    for (let i = 0; i < weeks.length; i++) {
      if (d >= weeks[i].start && d < weeks[i].end) {
        counts[i]++;
        break;
      }
    }
  });

  return { labels: weeks.map((w) => w.label), counts };
}

export async function getEmployerAnalytics({ userId, days = 30 }) {
  const employer = await Employer.findOne({ userId });
  if (!employer) {
    return {
      employer: null,
      totals: { jobs: 0, applications: 0, openJobs: 0 },
      applicationStatusBreakdown: {},
      avgMatchScore: null,
      timeToDecision: null,
      weeklyApplications: { labels: [], counts: [] },
      weeklyJobs: { labels: [], counts: [] },
      matchDistribution: [],
      topRoles: [],
      needsAttention: { stalePending: [], emptyJobs: [] },
    };
  }

  const employerId = employer._id;
  const since = new Date(Date.now() - days * DAY_MS);

  const [jobs, applications] = await Promise.all([
    Job.find({ employerId }).lean(),
    Application.find({ employerId }).lean(),
  ]);

  const openJobs = jobs.filter((j) => j.status === "OPEN").length;

  const appStatusMap = { pending: 0, accepted: 0, rejected: 0 };
  applications.forEach((a) => {
    if (appStatusMap[a.status] !== undefined) appStatusMap[a.status]++;
  });

  const scored = applications.filter(
    (a) => a.matchPercentage != null && a.matchPercentage > 0
  );
  const avgMatchScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((s, a) => s + a.matchPercentage, 0) / scored.length
        )
      : null;

  const decided = applications.filter(
    (a) => a.status !== "pending" && a.updatedAt && a.createdAt
  );
  let timeToDecision = null;
  if (decided.length > 0) {
    const totalDays = decided.reduce((sum, a) => {
      return sum + (new Date(a.updatedAt) - new Date(a.createdAt)) / DAY_MS;
    }, 0);
    timeToDecision = Math.round(totalDays / decided.length);
  }

  const recentApps = applications.filter((a) => new Date(a.createdAt) >= since);
  const recentJobs = jobs.filter((a) => new Date(a.createdAt) >= since);
  const weeklyApplications = bucketByWeek(recentApps, since);
  const weeklyJobs = bucketByWeek(recentJobs, since);

  const bins = [0, 0, 0, 0, 0];
  applications.forEach((a) => {
    const m = a.matchPercentage;
    if (m == null) return;
    if (m < 20) bins[0]++;
    else if (m < 40) bins[1]++;
    else if (m < 60) bins[2]++;
    else if (m < 80) bins[3]++;
    else bins[4]++;
  });
  const matchDistribution = bins;

  const jobAppCounts = {};
  applications.forEach((a) => {
    const jid = String(a.jobId);
    jobAppCounts[jid] = (jobAppCounts[jid] || 0) + 1;
  });
  const topRoles = jobs
    .map((j) => ({
      jobId: j._id,
      position: j.position,
      status: j.status,
      applicantCount: jobAppCounts[String(j._id)] || 0,
    }))
    .sort((a, b) => b.applicantCount - a.applicantCount)
    .slice(0, 8);

  const stalePending = applications
    .filter((a) => {
      if (a.status !== "pending") return false;
      const age = (Date.now() - new Date(a.createdAt)) / DAY_MS;
      return age > PENDING_THRESHOLD_DAYS;
    })
    .map((a) => ({
      applicationId: a._id,
      applicantName: a.applicantInfo?.fullName || "Candidate",
      jobId: a.jobId,
      createdAt: a.createdAt,
      daysPending: Math.round(
        (Date.now() - new Date(a.createdAt)) / DAY_MS
      ),
    }))
    .slice(0, 10);

  const emptyJobs = jobs
    .filter((j) => j.status === "OPEN" && !jobAppCounts[String(j._id)])
    .map((j) => ({
      jobId: j._id,
      position: j.position,
      createdAt: j.createdAt,
    }));

  return {
    employer: {
      name: employer.company?.name,
      branches: employer.company?.branches,
    },
    totals: { jobs: jobs.length, applications: applications.length, openJobs },
    applicationStatusBreakdown: appStatusMap,
    avgMatchScore,
    timeToDecision,
    weeklyApplications,
    weeklyJobs,
    matchDistribution,
    topRoles,
    needsAttention: { stalePending, emptyJobs },
  };
}

export default getEmployerAnalytics;
