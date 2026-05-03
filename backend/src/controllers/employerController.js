import catchAsync from "../utils/catchAsync.js";
import { createEmployerProfile } from "../services/employers/profile/createEmployerProfile.js";
import { updateEmployerProfile } from "../services/employers/profile/updateEmployerProfile.js";
import { deleteEmployerProfile } from "../services/employers/profile/deleteEmployerProfile.js";
import { getEmployerProfile } from "../services/employers/profile/getEmployerProfile.js";
import { getCacheJson, setCacheJson, delCache } from "../utils/redisHelper.js";

// ================================== //
//        CREATE EMPLOYER PROFILE     //
// ================================== //

export const createEmployer = catchAsync(async (req, res, next) => {
    const employer = await createEmployerProfile({
        userId: req.user._id,
        company: req.body.company,
    });
    await delCache(`employer:profile:${req.user._id}`);
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
    await delCache(`employer:profile:${req.user._id}`);
    res.status(200).json({ success: true, data: { employer } });
});

// ================================== //
//        DELETE EMPLOYER PROFILE     //
// ================================== //

export const deleteEmployer = catchAsync(async (req, res, next) => {
    await deleteEmployerProfile({ userId: req.user._id });
    await delCache(`employer:profile:${req.user._id}`);
    res.status(200).json({ success: true, message: "Employer profile deleted" });
});

// ================================== //
//         GET EMPLOYER PROFILE       //
// ================================== //

export const getMyEmployerProfile = catchAsync(async (req, res, next) => {
    const cacheKey = `employer:profile:${req.user._id}`;
    const cached = await getCacheJson(cacheKey);

    if (cached) {
        return res.status(200).json({
            success: true,
            data: { employer: cached },
            source: "cache",
        });
    }

    const employer = await getEmployerProfile({ userId: req.user._id });

    await setCacheJson(cacheKey, employer, 3600);

    res.status(200).json({
        success: true,
        data: { employer },
        source: "database",
    });
});