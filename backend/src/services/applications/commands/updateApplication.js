import Application from "../../../models/Application.js";
import AppError from "../../../utils/appError.js";
import { mapApplicantInfoFromNormalizedProfile } from "../../shared/profileInputMapper.js";
import { runPostSubmitWork } from "../notifications/runPostSubmitWork.js";
import { resolveApplicationProfileInput } from "../profile/resolveApplicationProfileInput.js";
import { shouldSkipAnalysis } from "../profile/shouldSkipAnalysis.js";
import { computeApplicationScore } from "../scoring/computeApplicationScore.js";
import { findOpenJobById } from "../helpers/findOpenJobById.js";

export const updateApplication = async ({ applicationId, body, user, file }) => {
    const application = await Application.findById(applicationId);
    if (!application) {
        throw new AppError("Application not found", 404);
    }

    if (String(application.userId) !== String(user._id)) {
        throw new AppError("Not authorized to update this application", 403);
    }

    const job = await findOpenJobById(application.jobId);
    const { cvId, skipAnalysis } = body;

    const profileInput = await resolveApplicationProfileInput({
        user,
        body,
        file,
        jobDescription: job.description || "",
    });

    if (profileInput.isManualApplication && !body.fullName) {
        throw new AppError("Applicant information is required for manual application", 400);
    }

    const score = await computeApplicationScore({
        normalizedProfile: profileInput.normalizedProfile,
        job,
        isPdfUpload: Boolean(file),
        parsedPdfAnalysis: profileInput.parsedPdfAnalysis,
        skipAnalysis,
        isManualApplication: profileInput.isManualApplication,
        userId: user._id,
    });

    application.applicantInfo = mapApplicantInfoFromNormalizedProfile(profileInput.normalizedProfile);
    application.matchPercentage = score.matchPercentage;
    application.matchDetails = score.matchDetails;

    if (cvId && cvId !== "manual" && !file) {
        application.cvId = cvId;
    } else {
        application.cvId = undefined;
    }

    if (file) {
        application.cvFile = {
            filename: file.originalname,
            path: file.path,
        };
        application.applicationMethod = "uploadPdf";
    }

    await application.save();

    if (file || shouldSkipAnalysis(skipAnalysis)) {
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
    }

    return application;
};

export default updateApplication;
