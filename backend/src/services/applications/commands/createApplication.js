import Application from "../../../models/Application.js";
import AppError from "../../../utils/appError.js";
import { mapApplicantInfoFromNormalizedProfile } from "../../shared/profileInputMapper.js";
import { runPostSubmitWork } from "../notifications/runPostSubmitWork.js";
import { resolveApplicationProfileInput } from "../profile/resolveApplicationProfileInput.js";
import { computeApplicationScore } from "../scoring/computeApplicationScore.js";
import { findOpenJobById } from "../helpers/findOpenJobById.js";

export const createApplication = async ({ body, user, file }) => {
    const { jobId, cvId, skipAnalysis } = body;
    if (!jobId) {
        throw new AppError("Job ID is required", 400);
    }

    const job = await findOpenJobById(jobId);

    const existingApplication = await Application.findOne({ userId: user._id, jobId });
    if (existingApplication) {
        return {
            alreadyApplied: true,
            applicationId: existingApplication._id,
            status: existingApplication.status,
        };
    }

    const profileInput = await resolveApplicationProfileInput({
        user,
        body,
        file,
        jobDescription: job.description || "",
    });

    const score = await computeApplicationScore({
        normalizedProfile: profileInput.normalizedProfile,
        job,
        isPdfUpload: Boolean(file),
        parsedPdfAnalysis: profileInput.parsedPdfAnalysis,
        skipAnalysis,
        isManualApplication: profileInput.isManualApplication,
        userId: user._id,
    });

    const applicationData = {
        userId: user._id,
        jobId,
        employerId: job.employerId._id,
        applicantInfo: mapApplicantInfoFromNormalizedProfile(profileInput.normalizedProfile),
        matchPercentage: score.matchPercentage,
        matchDetails: score.matchDetails,
        applicationMethod: profileInput.applicationMethod,
    };

    if (file) {
        applicationData.cvFile = {
            filename: file.originalname,
            path: file.path,
        };
    }

    if (cvId && cvId !== "manual") {
        applicationData.cvId = cvId;
    }

    const application = await Application.create(applicationData);

    setImmediate(async () => {
        await runPostSubmitWork({
            application,
            normalizedProfile: profileInput.normalizedProfile,
            job,
            userId: user._id,
            isPdfUpload: Boolean(file),
            isManualApplication: profileInput.isManualApplication,
            skipAnalysis,
            file,
        });
    });

    return {
        alreadyApplied: false,
        application,
        matchPercentage: score.matchPercentage,
    };
};

export default createApplication;
