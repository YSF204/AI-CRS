import User from "../models/User.js";
import CV from "../models/CV.js";
import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// ================================== //
//        GET PLATFORM STATS          //
// ================================== //

export const getStats = catchAsync(async (req, res, next) => {
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

    // Recent registrations — last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });

    // Recent jobs — last 7 days
    const recentJobs = await Job.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
        success: true,
        data: {
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
        },
    });
});


// ================================== //
//    UPDATE USER ACCOUNT STATUS      //
// ================================== //

export const updateUserStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { accountStatus } = req.body;

    const validStatuses = ["ACTIVE", "INACTIVE", "PENDING"];
    if (!accountStatus || !validStatuses.includes(accountStatus)) {
        return next(
            new AppError(`accountStatus must be one of: ${validStatuses.join(", ")}`, 400)
        );
    }

    // Prevent admin from modifying another admin's status
    const targetUser = await User.findById(id);
    if (!targetUser) {
        return next(new AppError("User not found", 404));
    }

    if (targetUser.role === "ADMIN") {
        return next(new AppError("Cannot modify the status of another admin", 403));
    }

    const updated = await User.findByIdAndUpdate(
        id,
        { accountStatus },
        { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
        success: true,
        message: `User status updated to ${accountStatus}`,
        data: { user: updated },
    });
});


// ================================== //
//     GET ALL USERS (ADMIN VIEW)     //
// ================================== //

export const getAllUsers = catchAsync(async (req, res, next) => {
    const {
        role,
        accountStatus,
        search,
        page = 1,
        limit = 20,
    } = req.query;

    const filter = {};

    if (role) filter.role = role.toUpperCase();
    if (accountStatus) filter.accountStatus = accountStatus.toUpperCase();
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        data: {
            users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        },
    });
});
