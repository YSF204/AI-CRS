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

    const updated = await Employer.findByIdAndUpdate(
        employer._id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: { employer: updated } });
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