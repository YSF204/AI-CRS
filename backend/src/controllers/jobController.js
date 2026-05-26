import catchAsync from "../utils/catchAsync.js";
import { createJob as createJobService } from "../services/jobs/commands/createJob.js";
import { updateJob as updateJobService } from "../services/jobs/commands/updateJob.js";
import { deleteJob as deleteJobService } from "../services/jobs/commands/deleteJob.js";
import { getAllJobs as getAllJobsService } from "../services/jobs/queries/getAllJobs.js";
import { getExternalJobs as getExternalJobsService } from "../services/jobs/queries/getExternalJobs.js";
import { getJobById as getJobByIdService } from "../services/jobs/queries/getJobById.js";
import { getEmployerJobs as getEmployerJobsService } from "../services/jobs/queries/getEmployerJobs.js";


// ================================== //
//         CREATE NEW JOB             //
// ================================== //

export const createJob = catchAsync(async (req, res, next) => {
  const job = await createJobService({
    userId: req.user._id,
    body: req.body,
  });

  res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: { job },
  });
});

// ================================== //
//         GET ALL JOBS               //
// ================================== //

export const getAllJobs = catchAsync(async (req, res) => {
  const [jobs, externalJobs] = await Promise.all([
    getAllJobsService(),
    getExternalJobsService(),
  ]);

  res.status(200).json({
    success: true,
    count: jobs.length + externalJobs.length,
    data: { jobs, externalJobs },
  });
});

// ================================== //
//         GET JOB BY ID              //
// ================================== //

export const getJobById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const job = await getJobByIdService(id);

  res.status(200).json({
    success: true,
    data: { job },
  });
});

// ================================== //
//      GET ALL EMPLOYER JOBS         //
// ================================== //

export const getEmployerJobs = catchAsync(async (req, res, next) => {
  const jobs = await getEmployerJobsService({ userId: req.user._id });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: { jobs },
  });
});

// ================================== //
//          UPDATE JOB                //
// ================================== //

export const updateJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedJob = await updateJobService({
    jobId: id,
    userId: req.user._id,
    body: req.body,
  });

  res.status(200).json({
    success: true,
    message: "Job updated successfully",
    data: { job: updatedJob },
  });
});

// ================================== //
//          DELETE JOB                //
// ================================== //

export const deleteJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  await deleteJobService({
    jobId: id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});
