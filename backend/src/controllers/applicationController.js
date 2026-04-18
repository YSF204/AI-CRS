import catchAsync from "../utils/catchAsync.js";
import { analyzeCvForJob } from "../services/applications/commands/analyzeCvForJob.js";
import { createApplication } from "../services/applications/commands/createApplication.js";
import { updateApplication as updateApplicationCommand } from "../services/applications/commands/updateApplication.js";
import { updateApplicationStatus as updateApplicationStatusCommand } from "../services/applications/commands/updateApplicationStatus.js";
import { deleteApplication as deleteApplicationCommand } from "../services/applications/commands/deleteApplication.js";
import { getMyApplications as getMyApplicationsQuery } from "../services/applications/queries/getMyApplications.js";
import { getEmployerApplications as getEmployerApplicationsQuery } from "../services/applications/queries/getEmployerApplications.js";
import { getApplicationsByJob as getApplicationsByJobQuery } from "../services/applications/queries/getApplicationsByJob.js";
import { getApplicationById as getApplicationByIdQuery } from "../services/applications/queries/getApplicationById.js";

// ================================== //
//      ANALYZE CV FOR A JOB          //
// ================================== //
export const analyzeCv = catchAsync(async (req, res, next) => {
  const result = await analyzeCvForJob({
    body: req.body,
    user: req.user,
    file: req.file,
  });

  res.status(200).json({
    success: true,
    data: {
      matchPercentage: result.matchPercentage,
      matchDetails: result.matchDetails,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      jobId: result.jobId,
      cvId: result.cvId,
      applicantInfo: result.applicantInfo,
    },
  });
});

// ================================== //
//      APPLY FOR A JOB               //
// ================================== //
export const applyForJob = catchAsync(async (req, res, next) => {
  const result = await createApplication({
    body: req.body,
    user: req.user,
    file: req.file,
  });

  if (result.alreadyApplied) {
    return res.status(200).json({
      success: true,
      message: "You have already applied for this job.",
      data: {
        alreadyApplied: true,
        applicationId: result.applicationId,
        status: result.status,
      },
    });
  }
  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: {
      application: result.application._id,
    },
    matchPercentage: result.matchPercentage,
  });
});


// ================================== //
//   GET APPLICATIONS FOR LOGGED USER //
// ================================== //
export const getMyApplications = catchAsync(async (req, res) => {
  const result = await getMyApplicationsQuery({ userId: req.user._id });

  res.status(200).json({
    success: true,
    count: result.count,
    data: { applications: result.applications },
  });
});

// ================================== //
//   GET APPLICATIONS FOR EMPLOYER    //
// ================================== //
export const getEmployerApplications = catchAsync(async (req, res) => {
  const result = await getEmployerApplicationsQuery({ userId: req.user._id });

  res.status(200).json({
    success: true,
    count: result.count,
    data: { applications: result.applications },
  });
});

// ================================== //
//   GET APPLICATIONS FOR A JOB       //
// ================================== //
export const getApplicationsByJob = catchAsync(async (req, res, next) => {
  const result = await getApplicationsByJobQuery({
    userId: req.user._id,
    jobId: req.params.jobId,
  });

  res.status(200).json({
    success: true,
    count: result.count,
    data: { applications: result.applications },
  });
});

// ================================== //
//   GET APPLICATION BY ID            //
// ================================== //
export const getApplicationById = catchAsync(async (req, res, next) => {
  const application = await getApplicationByIdQuery({
    applicationId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: { application },
  });
});

// ================================== //
//   UPDATE APPLICATION               //
// ================================== //
export const updateApplication = catchAsync(async (req, res, next) => {
  const application = await updateApplicationCommand({
    applicationId: req.params.id,
    body: req.body,
    user: req.user,
    file: req.file,
  });

  res.status(200).json({
    success: true,
    message: "Application updated successfully",
    data: { application },
  });
});

// ================================== //
//   UPDATE APPLICATION STATUS        //
// ================================== //
export const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const application = await updateApplicationStatusCommand({
    applicationId: req.params.id,
    status: req.body.status,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Application status updated",
    data: { application },
  });
});

// ================================== //
//   DELETE APPLICATION               //
// ================================== //
export const deleteApplication = catchAsync(async (req, res, next) => {
  await deleteApplicationCommand({
    applicationId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Application deleted",
  });
});
