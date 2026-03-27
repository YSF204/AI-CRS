import Employer from "../models/Employer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// ================================== //
//        CREATE EMPLOYER PROFILE     //
// ================================== //

export const createEmployer = catchAsync(async (req, res, next) => {
    const { company } = req.body;

    if (!company) return next(new AppError("Please provide company details", 400));

    const existing = await Employer.findOne({ userId: req.user._id });
    
    if (existing) return next(new AppError("Employer profile already exists", 400));

    const employer = await Employer.create({ userId: req.user._id, company });

    res.status(201).json({ success: true, data: { employer } });
});

// ================================== //
//        UPDATE EMPLOYER PROFILE     //
// ================================== //

export const updateEmployer = catchAsync(async (req, res, next) => {
    const employer = await Employer.findOne({ userId: req.user._id });

    if (!employer) return next(new AppError("Employer profile not found", 404));

    // 1. Enforce strict cooldown: 7 days between updates
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const timeSinceLastUpdate = Date.now() - employer.updatedAt.getTime();

    if (timeSinceLastUpdate < SEVEN_DAYS) {
        const daysLeft = Math.ceil((SEVEN_DAYS - timeSinceLastUpdate) / (1000 * 60 * 60 * 24));
        return next(new AppError(`Profile details can only be changed once every 7 days. Try again in ${daysLeft} days.`, 429));
    }

    // 2. Prevent changing immutable fields (e.g., license) by selectively updating allowed fields
    if (req.body.company) {
        if (req.body.company.name !== undefined) employer.company.name = req.body.company.name;
        if (req.body.company.website !== undefined) employer.company.website = req.body.company.website;
        if (req.body.company.contactEmail !== undefined) employer.company.contactEmail = req.body.company.contactEmail;
        if (req.body.company.branches !== undefined) employer.company.branches = req.body.company.branches;
    }

    await employer.save();

    res.status(200).json({ success: true, data: { employer } });
});

// ================================== //
//        DELETE EMPLOYER PROFILE     //
// ================================== //

export const deleteEmployer = catchAsync(async (req, res, next) => {
    const employer = await Employer.findOne({ userId: req.user._id });

    if (!employer) return next(new AppError("Employer profile not found", 404));

    await Employer.findByIdAndDelete(employer._id);

    res.status(200).json({ success: true, message: "Employer profile deleted" });
});

// ================================== //
//         GET EMPLOYER PROFILE       //
// ================================== //

export const getMyEmployerProfile = catchAsync(async (req, res, next) => {
    const employer = await Employer.findOne({ userId: req.user._id });

    if (!employer) return next(new AppError("Employer profile not found", 404));

    res.status(200).json({ success: true, data: { employer } });
});