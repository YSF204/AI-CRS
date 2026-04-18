import User from "../../../models/User.js";
import CV from "../../../models/CV.js";
import Job from "../../../models/Job.js";
import Employer from "../../../models/Employer.js";

export const getPlatformStats = async () => {
    const [
        totalUsers,
        totalEmployees,
        totalEmployers,
        totalAdmins,
        pendingEmployers,
        activeUsers,
        inactiveUsers,
        totalCVs,
        totalJobs,
        openJobs,
        totalEmployerProfiles,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "EMPLOYEE" }),
        User.countDocuments({ role: "EMPLOYER" }),
        User.countDocuments({ role: "ADMIN" }),
        User.countDocuments({ role: "EMPLOYER", accountStatus: "PENDING" }),
        User.countDocuments({ accountStatus: "ACTIVE" }),
        User.countDocuments({ accountStatus: "INACTIVE" }),
        CV.countDocuments(),
        Job.countDocuments(),
        Job.countDocuments({ status: "OPEN" }),
        Employer.countDocuments(),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentUsers, recentJobs] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Job.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    return {
        users: {
            total: totalUsers,
            employees: totalEmployees,
            employers: totalEmployers,
            admins: totalAdmins,
            active: activeUsers,
            inactive: inactiveUsers,
            pendingApproval: pendingEmployers,
            recentRegistrations: recentUsers,
        },
        cvs: {
            total: totalCVs,
        },
        jobs: {
            total: totalJobs,
            open: openJobs,
            recentlyPosted: recentJobs,
        },
        employers: {
            total: totalEmployerProfiles,
        },
    };
};

export default getPlatformStats;
