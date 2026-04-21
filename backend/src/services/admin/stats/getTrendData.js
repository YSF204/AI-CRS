import User from "../../../models/User.js";
import CV from "../../../models/CV.js";
import Job from "../../../models/Job.js";

export const getTrendData = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 7-day trends
  const [
    users7d,
    employees7d,
    employers7d,
    cvs7d,
    jobs7d,
    openJobs7d,
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ role: "EMPLOYEE", createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ role: "EMPLOYER", createdAt: { $gte: sevenDaysAgo } }),
    CV.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Job.countDocuments({ status: "OPEN", createdAt: { $gte: sevenDaysAgo } }),
  ]);

  // 30-day trends
  const [
    users30d,
    employees30d,
    employers30d,
    cvs30d,
    jobs30d,
    openJobs30d,
  ] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ role: "EMPLOYEE", createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ role: "EMPLOYER", createdAt: { $gte: thirtyDaysAgo } }),
    CV.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Job.countDocuments({ status: "OPEN", createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  return {
    sevenDays: {
      users: users7d,
      employees: employees7d,
      employers: employers7d,
      cvs: cvs7d,
      jobs: jobs7d,
      openJobs: openJobs7d,
    },
    thirtyDays: {
      users: users30d,
      employees: employees30d,
      employers: employers30d,
      cvs: cvs30d,
      jobs: jobs30d,
      openJobs: openJobs30d,
    },
  };
};

export default getTrendData;
