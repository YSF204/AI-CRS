import AppError from "../../utils/appError.js";

const toId = (value) => String(value || "");

export const assertCvOwnership = (cv, userId) => {
    if (!cv) {
        throw new AppError("CV not found", 404);
    }

    if (toId(cv.userId) !== toId(userId)) {
        throw new AppError("Not authorized to use this CV", 403);
    }
};

export const assertJobOwnership = (job, employerId) => {
    if (!job) {
        throw new AppError("Job not found", 404);
    }

    if (toId(job.employerId) !== toId(employerId)) {
        throw new AppError("Not authorized to update this job", 403);
    }
};

export const assertApplicationAccess = (application, userId, employerUserId) => {
    if (!application) {
        throw new AppError("Application not found", 404);
    }

    const isOwner = toId(application.userId?._id || application.userId) === toId(userId);
    const employerOwnerUserId =
        application.employerId?.userId?._id ||
        application.employerId?.userId ||
        application.employerUserId ||
        null;
    const isEmployer =
        employerUserId != null &&
        employerOwnerUserId != null &&
        toId(employerOwnerUserId) === toId(employerUserId);

    if (!isOwner && !isEmployer) {
        throw new AppError("Not authorized to access this application", 403);
    }
};

export default {
    assertCvOwnership,
    assertJobOwnership,
    assertApplicationAccess,
};
