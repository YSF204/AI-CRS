import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "./../utils/appError.js";


const verifyOwnership = async (req , res , next) =>{
  const {id} = req.params;
  const job = await Job.findById(id);
  const employer = await Employer.findOne({userId: req.user._id});

  if(!job){
    return next(new AppError("Job not found", 404));
  }

  if(!employer){
    return next(new AppError("Employer not found", 404));
  }

  if(job.employerId.toString() !== employer._id.toString()){
    return next(new AppError("Not authorized to update this job", 403));
  }

  next();
}


// ================================== //
//         CREATE NEW JOB             //
// ================================== //

export const createJob = catchAsync(async (req, res, next) => {
  const {
    position,
    description,
    salary,
    workSite,
    workDuration,
    yearsOfExperience,
    language,
    certification,
    softSkills,
    technicalSkills,
  } = req.body;

  // make sure that all the fields are provided
  if (
    !position ||
    !description ||
    !salary ||
    !workSite ||
    !workDuration ||
    !yearsOfExperience
  ) {
    return next(new AppError("Please provide all required fields", 400));
  }

  // check if the employer exists and is active
  const employer = await Employer.findOne({ userId: req.user._id });
  if (!employer) {
    return next(new AppError("Employer not found", 404));
  }

  const job = await Job.create({
    employerId: employer._id,
    position,
    description,
    salary,
    workSite,
    workDuration,
    yearsOfExperience,
    language: language || [],
    certification: certification || [],
    softSkills: softSkills || [],
    technicalSkills: technicalSkills || [],
    status: "OPEN",
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
  const jobs = await Job.find({ status: "OPEN" })
    .populate("employerId", "company")
    .sort({ createdAt: -1 });

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

  const job = await Job.findById(id);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // Verify ownership
  verifyOwnership(req , res , next);

  const updatedJob = await Job.findByIdAndUpdate(
    id,
    { ...req.body },
    { new: true, runValidators: true },
  );

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

  // Find the job
  const job = await Job.findById(id);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  // Verify ownership
  verifyOwnership(req , res , next);

  await Job.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
  });
});
