import catchAsync from "../utils/catchAsync.js";
import { createEmployerProfile } from "../services/employers/profile/createEmployerProfile.js";
import { updateEmployerProfile } from "../services/employers/profile/updateEmployerProfile.js";
import { deleteEmployerProfile } from "../services/employers/profile/deleteEmployerProfile.js";
import { getEmployerProfile } from "../services/employers/profile/getEmployerProfile.js";

// ================================== //
//        CREATE EMPLOYER PROFILE     //
// ================================== //

export const createEmployer = catchAsync(async (req, res, next) => {
    const employer = await createEmployerProfile({
        userId: req.user._id,
        company: req.body.company,
    });

    res.status(201).json({ success: true, data: { employer } });
});

// ================================== //
//        UPDATE EMPLOYER PROFILE     //
// ================================== //

export const updateEmployer = catchAsync(async (req, res, next) => {
    const employer = await updateEmployerProfile({
        userId: req.user._id,
        body: req.body,
    });

    res.status(200).json({ success: true, data: { employer } });
});

// ================================== //
//        DELETE EMPLOYER PROFILE     //
// ================================== //

export const deleteEmployer = catchAsync(async (req, res, next) => {
    await deleteEmployerProfile({ userId: req.user._id });

    res.status(200).json({ success: true, message: "Employer profile deleted" });
});

// ================================== //
//         GET EMPLOYER PROFILE       //
// ================================== //

export const getMyEmployerProfile = catchAsync(async (req, res, next) => {
    const employer = await getEmployerProfile({ userId: req.user._id });

    res.status(200).json({ success: true, data: { employer } });
});