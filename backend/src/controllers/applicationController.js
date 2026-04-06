import Application from "../models/Application.js";
import CV from "../models/CV.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Employer from "../models/Employer.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import {
  calculateMatchPercentage,
  generateAIMatchAnalysis,
  extractStrengthsWeaknesses,
} from "../services/matching/matchingService.js";
import { sendEmail } from "../utils/email.js";

// ================================== //
//      ANALYZE CV FOR A JOB          //
// ================================== //
export const analyzeCv = catchAsync(async (req, res, next) => {
  const { jobId, cvId } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!jobId) {
    return next(new AppError("Job ID is required", 400));
  }

  if (!cvId && !req.file) {
    return next(new AppError("Please select a CV or upload a PDF file", 400));
  }

  let cv;
  let applicantInfo;

  // Handle uploaded PDF file
  if (req.file) {
    // For now, create a temporary CV record for the uploaded file
    cv = {
      _id: "temp_" + Date.now(),
      userId,
      fullName: "Uploaded CV",
      contact: {
        email: "",
        phone: "",
      },
      summary: "",
      technicalSkills: [],
      softSkills: [],
      yearsOfExperience: 0,
      language: [],
      pdfPath: req.file.path,
    };
    applicantInfo = {
      fullName: req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : "Uploaded CV",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      summary: "",
      technicalSkills: [],
      softSkills: [],
      yearsOfExperience: 0,
      languages: [],
    };
  } else {
    // Handle existing CV
    cv = await CV.findById(cvId);
    if (!cv) {
      return next(new AppError("CV not found", 404));
    }
    if (cv.userId.toString() !== userId.toString()) {
      return next(new AppError("Not authorized to use this CV", 403));
    }

    applicantInfo = {
      fullName: cv.fullName || (req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : "Candidate"),
      email: cv.contact?.email || "",
      phone: cv.contact?.phone || "",
      linkedin: cv.contact?.linkedin || "",
      github: cv.contact?.github || "",
      summary: cv.summary || "",
      technicalSkills: cv.technicalSkills || [],
      softSkills: cv.softSkills || [],
      yearsOfExperience: cv.yearsOfExperience || 0,
      languages: cv.language || [],
    };
  }

  // Check if job exists
  const job = await Job.findById(jobId).populate("employerId");
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.status !== "OPEN") {
    return next(new AppError("This job is no longer open", 400));
  }

  // Calculate match percentage
  const matchResult = calculateMatchPercentage(applicantInfo, job);
  // Generate AI analysis
  let percentageScore = matchResult.percentage;
  let strengths = [];
  let weaknesses = [];
  let matchAnalysisStr = "";
  
  try {
    const aiAnalysis = await generateAIMatchAnalysis(
      applicantInfo,
      job,
      job._id,
      req.user._id,
      cvId ? "EXISTING_PROFILE" : "CV_UPLOAD"
    );
    
    if (aiAnalysis && !aiAnalysis.error) {
      percentageScore = aiAnalysis.overall_fit_percentage != null ? aiAnalysis.overall_fit_percentage : percentageScore;
      strengths = aiAnalysis.strengths || [];
      weaknesses = (aiAnalysis.gaps || []).map(g => `${g.severity} Gap: ${g.gap} - ${g.suggestion}`);
      matchAnalysisStr = aiAnalysis.recruiter_summary || JSON.stringify(aiAnalysis);
    } else {
      matchAnalysisStr = aiAnalysis?.message || "Analysis generation failed or invalid input";
    }
  } catch (error) {
    console.error("AI analysis error:", error);
    matchAnalysisStr = "Analysis generation failed";
  }

  if (strengths.length === 0 && weaknesses.length === 0) {
    const ext = extractStrengthsWeaknesses(
      matchAnalysisStr,
      matchResult.breakdown,
    );
    strengths = ext.strengths;
    weaknesses = ext.weaknesses;
  }

  // Return analysis without creating application
  res.status(200).json({
    success: true,
    data: {
      matchPercentage: percentageScore,
      matchDetails: {
        ...matchResult.breakdown,
        matchAnalysis: matchAnalysisStr,
      },
      strengths,
      weaknesses,
      jobId,
      cvId: cvId || cv._id,
      applicantInfo: {
        fullName: applicantInfo.fullName || "Candidate",
        email: applicantInfo.email || "",
        phone: applicantInfo.phone || "",
      },
    },
  });
});

// ================================== //
//      APPLY FOR A JOB               //
// ================================== //
export const applyForJob = catchAsync(async (req, res, next) => {
  const {
    jobId,
    cvId,
    fullName,
    email,
    phone,
    yearsOfExperience,
    technicalSkills,
    softSkills,
    languages,
    summary,
  } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!jobId) {
    return next(new AppError("Job ID is required", 400));
  }

  let cvData = null;
  let isManualApplication = cvId === "manual" || !cvId;
  let applicationMethod = "manual";

  // If using CV, validate it exists and belongs to user
  if (cvId && cvId !== "manual") {
    const cv = await CV.findById(cvId);
    if (!cv) {
      return next(new AppError("CV not found", 404));
    }
    if (cv.userId.toString() !== userId.toString()) {
      return next(new AppError("Not authorized to use this CV", 403));
    }
    cvData = cv;
    isManualApplication = false;
    applicationMethod = req.file ? "uploadPdf" : "existingCv";
  } else if (req.file) {
    applicationMethod = "uploadPdf";
  }

  // If manual application, validate required manual fields
  if (isManualApplication && !fullName) {
    return next(
      new AppError(
        "Applicant information is required for manual application",
        400,
      ),
    );
  }

  // Check if job exists
  const job = await Job.findById(jobId).populate("employerId");
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.status !== "OPEN") {
    return next(new AppError("This job is no longer open", 400));
  }

  // Check if user already applied for this job
  const existingApplication = await Application.findOne({
    userId,
    jobId,
  });

  if (existingApplication) {
    // Return a 409 Conflict with the existing application details to prompt the user for editing
    return res.status(409).json({
      success: false,
      message: "You have already applied for this job.",
      data: {
        alreadyApplied: true,
        applicationId: existingApplication._id,
        status: existingApplication.status,
      },
    });
  }

  // Prepare applicant info - use CV data or manual data
  let finalApplicantInfo;
  if (cvData) {
    finalApplicantInfo = {
      fullName: cvData.fullName || "",
      email: cvData.contact?.email || "",
      phone: cvData.contact?.phone || "",
      linkedin: cvData.contact?.linkedin || "",
      github: cvData.contact?.github || "",
      summary: cvData.summary || "",
      technicalSkills: cvData.technicalSkills || [],
      softSkills: cvData.softSkills || [],
      yearsOfExperience: cvData.yearsOfExperience || 0,
      languages: cvData.language || [],
    };
  } else {
    // Manual application data
    finalApplicantInfo = {
      fullName: fullName || "",
      email: email || "",
      phone: phone || "",
      linkedin: "",
      github: "",
      summary: summary || "",
      technicalSkills: technicalSkills || [],
      softSkills: softSkills || [],
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      languages: languages || [],
    };
  }

  // Calculate match percentage
  const matchResult = calculateMatchPercentage(finalApplicantInfo, job);
  let percentageScore = matchResult.percentage;

  // Generate AI analysis
  let matchAnalysisStr = "";
  try {
    const aiAnalysis = await generateAIMatchAnalysis(
      finalApplicantInfo,
      job,
      job._id,
      userId,
      isManualApplication ? "MANUAL_FORM" : (req.file ? "CV_UPLOAD" : "EXISTING_PROFILE")
    );
    
    if (aiAnalysis && !aiAnalysis.error) {
      percentageScore = aiAnalysis.overall_fit_percentage != null ? aiAnalysis.overall_fit_percentage : percentageScore;
      matchAnalysisStr = aiAnalysis.recruiter_summary || "";
    }
  } catch (error) {
    console.error("AI analysis error:", error);
    matchAnalysisStr = "Analysis generation failed";
  }

  // If percentage < 50%, reject the application
  if (percentageScore < 50) {
    return res.status(400).json({
      success: false,
      message: `Application rejected. Your match percentage is ${percentageScore}%, which is below the required 50% threshold.`,
      matchPercentage: percentageScore,
    });
  }

  // Create application
  const applicationData = {
    userId,
    jobId,
    employerId: job.employerId._id,
    applicantInfo: finalApplicantInfo,
    matchPercentage: percentageScore,
    matchDetails: {
      ...matchResult.breakdown,
      matchAnalysis: matchAnalysisStr,
    },
    applicationMethod,
  };

  // Add cvId only if using CV method (not manual or uploadPdf)
  if (cvId && cvId !== "manual") {
    applicationData.cvId = cvId;
  }

  const application = await Application.create(applicationData);

  // Send HTML email to employer
  const employer = await Employer.findById(job.employerId);

  if (employer?.company?.contactEmail) {
    try {
      const htmlEmail = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #4ecd c4, #1a1a2e); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8f9fa; }
            .match-score { font-size: 24px; font-weight: bold; color: #4ecdc4; text-align: center; margin: 20px 0; }
            .breakdown { margin: 20px 0; }
            .breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
            .breakdown-label { font-weight: 500; }
            .breakdown-value { color: #f7b731; font-weight: bold; }
            .analysis { margin: 20px 0; padding: 15px; background: white; border-left: 4px solid #4ecdc4; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Application Received</h1>
            </div>
            <div class="content">
              <p>Hi ${employer?.company?.name || "Employer"},</p>
              <p>You have received a new application for the position of <strong>${job.position}</strong>.</p>
              
              <h3>Candidate Information</h3>
              <p><strong>Name:</strong> ${finalApplicantInfo.fullName}</p>
              <p><strong>Email:</strong> ${finalApplicantInfo.email}</p>
              <p><strong>Phone:</strong> ${finalApplicantInfo.phone}</p>
              ${finalApplicantInfo.linkedin ? `<p><strong>LinkedIn:</strong> ${finalApplicantInfo.linkedin}</p>` : ""}
              ${finalApplicantInfo.github ? `<p><strong>GitHub:</strong> ${finalApplicantInfo.github}</p>` : ""}
              
              <h3>Match Analysis</h3>
              <div class="match-score">${percentageScore}% Match</div>
              
              <div class="breakdown">
                <div class="breakdown-row">
                  <span class="breakdown-label">Technical Skills:</span>
                  <span class="breakdown-value">${matchResult.breakdown.technicalSkillsMatch}%</span>
                </div>
                <div class="breakdown-row">
                  <span class="breakdown-label">Experience:</span>
                  <span class="breakdown-value">${matchResult.breakdown.experienceMatch}%</span>
                </div>
                <div class="breakdown-row">
                  <span class="breakdown-label">Soft Skills:</span>
                  <span class="breakdown-value">${matchResult.breakdown.softSkillsMatch}%</span>
                </div>
                <div class="breakdown-row">
                  <span class="breakdown-label">Languages:</span>
                  <span class="breakdown-value">${matchResult.breakdown.languagesMatch}%</span>
                </div>
              </div>
              
              <div class="analysis">
                <h4>AI Analysis</h4>
                <p>${matchAnalysis}</p>
              </div>
              
              <p><strong>Summary:</strong> ${finalApplicantInfo.summary}</p>
              
              <p>Log in to your dashboard to review this application and contact the candidate.</p>
            </div>
            <div class="footer">
              <p>© 2024 CV Editor. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        email: employer.company.contactEmail,
        subject: `New Application: ${finalApplicantInfo.fullName} for ${job.position}`,
        html: htmlEmail,
      });
      application.isNotified = true;
      await application.save();
    } catch (error) {
      console.error("Error sending email to employer:", error);
    }
  }

  // Send HTML confirmation email to applicant
  if (finalApplicantInfo.email) {
    try {
      const confirmationEmail = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #4ecdc4, #1a1a2e); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8f9fa; }
            .success { color: #4ecdc4; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #f7b731; color: #000; text-decoration: none; margin: 10px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Submitted!</h1>
            </div>
            <div class="content">
              <p>Hi ${finalApplicantInfo.fullName},</p>
              <p>Congratulations! Your application for the position of <strong>${job.position}</strong> has been submitted successfully.</p>
              
              <h3>Your Match Score</h3>
              <p style="font-size: 28px; text-align: center; color: #f7b731; font-weight: bold;">${percentageScore}%</p>
              
              <p>We believe you are a strong fit for this role. The employer will review your application and contact you within 1-2 weeks.</p>
              
              <h3>Position Details</h3>
              <p><strong>Title:</strong> ${job.position}</p>
              <p><strong>Location:</strong> ${job.workSite}</p>
              <p><strong>Duration:</strong> ${job.workDuration || "Not specified"}</p>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/employee/applications" class="button">View My Applications</a>
              </p>
              
              <p>Best of luck with your application!</p>
              <p>Best regards,<br>The CV Editor Team</p>
            </div>
            <div class="footer">
              <p>© 2024 CV Editor. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        email: finalApplicantInfo.email,
        subject: `Application Confirmation: ${finalApplicantInfo.fullName} - ${job.position}`,
        html: confirmationEmail,
      });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  }

  res.status(201).json({
    success: true,
    message: `Application submitted successfully!`,
    data: {
      application,
      matchPercentage: percentageScore,
    },
  });
});

// ================================== //
//   GET APPLICATIONS FOR LOGGED USER //
// ================================== //
export const getMyApplications = catchAsync(async (req, res) => {
  const applications = await Application.find({ userId: req.user._id })
    .populate({
      path: "jobId",
      select: "position workSite salary",
      model: "Job",
    })
    .populate({
      path: "employerId",
      select: "company.name",
      model: "Employer",
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: { applications },
  });
});

// ================================== //
//   GET APPLICATIONS FOR EMPLOYER    //
// ================================== //
export const getEmployerApplications = catchAsync(async (req, res) => {
  const employer = await Employer.findOne({ userId: req.user._id });

  if (!employer) {
    return res.status(404).json({
      success: false,
      message: "Employer profile not found",
    });
  }

  const applications = await Application.find({ employerId: employer._id })
    .populate("userId", "firstName lastName email")
    .populate("jobId", "position workSite salary")
    .populate("cvId", "jobTitle technicalSkills")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: { applications },
  });
});

// ================================== //
//   GET APPLICATION BY ID            //
// ================================== //
export const getApplicationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const application = await Application.findById(id)
    .populate("userId")
    .populate("jobId")
    .populate("cvId")
    .populate("employerId");

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Check authorization
  const isOwner = application.userId._id.toString() === req.user._id.toString();
  const isEmployer =
    application.employerId.userId.toString() === req.user._id.toString();

  if (!isOwner && !isEmployer) {
    return next(new AppError("Not authorized to view this application", 403));
  }

  res.status(200).json({
    success: true,
    data: { application },
  });
});

// ================================== //
//   UPDATE APPLICATION               //
// ================================== //
export const updateApplication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    cvId,
    fullName,
    email,
    phone,
    yearsOfExperience,
    technicalSkills,
    softSkills,
    languages,
    summary,
  } = req.body;
  const userId = req.user._id;

  const application = await Application.findById(id);
  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  if (application.userId.toString() !== userId.toString()) {
    return next(new AppError("Not authorized to update this application", 403));
  }

  const job = await Job.findById(application.jobId);
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.status !== "OPEN") {
    return next(new AppError("This job is no longer open", 400));
  }

  let cvData = null;
  let isManualApplication = cvId === "manual" || !cvId;

  // If using CV, validate it exists and belongs to user
  if (cvId && cvId !== "manual") {
    const cv = await CV.findById(cvId);
    if (!cv) {
      return next(new AppError("CV not found", 404));
    }
    if (cv.userId.toString() !== userId.toString()) {
      return next(new AppError("Not authorized to use this CV", 403));
    }
    cvData = cv;
    isManualApplication = false;
  }

  // If manual application, validate required manual fields
  if (isManualApplication && !fullName) {
    return next(
      new AppError(
        "Applicant information is required for manual application",
        400,
      ),
    );
  }

  // Prepare applicant info - use CV data or manual data
  let finalApplicantInfo;
  if (cvData) {
    finalApplicantInfo = {
      fullName: cvData.fullName || "",
      email: cvData.contact?.email || "",
      phone: cvData.contact?.phone || "",
      linkedin: cvData.contact?.linkedin || "",
      github: cvData.contact?.github || "",
      summary: cvData.summary || "",
      technicalSkills: cvData.technicalSkills || [],
      softSkills: cvData.softSkills || [],
      yearsOfExperience: cvData.yearsOfExperience || 0,
      languages: cvData.language || [],
    };
  } else {
    // Manual application data
    finalApplicantInfo = {
      fullName: fullName || "",
      email: email || "",
      phone: phone || "",
      linkedin: "",
      github: "",
      summary: summary || "",
      technicalSkills: technicalSkills || [],
      softSkills: softSkills || [],
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      languages: languages || [],
    };
  }

  // Recalculate match percentage
  const matchResult = calculateMatchPercentage(finalApplicantInfo, job);
  let percentageScore = matchResult.percentage;

  // Generate AI analysis
  let matchAnalysisStr = "";
  try {
    const aiAnalysis = await generateAIMatchAnalysis(
      finalApplicantInfo,
      job,
      job._id,
      userId,
      isManualApplication ? "MANUAL_FORM" : (cvId ? "EXISTING_PROFILE" : "CV_UPLOAD")
    );
    
    if (aiAnalysis && !aiAnalysis.error) {
      percentageScore = aiAnalysis.overall_fit_percentage != null ? aiAnalysis.overall_fit_percentage : percentageScore;
      matchAnalysisStr = aiAnalysis.recruiter_summary || JSON.stringify(aiAnalysis);
    }
  } catch (error) {
    console.error("AI analysis error:", error);
    matchAnalysisStr = "Analysis generation failed";
  }

  // Update application
  application.applicantInfo = finalApplicantInfo;
  application.matchPercentage = percentageScore;
  application.matchDetails = {
    ...matchResult.breakdown,
    matchAnalysis: matchAnalysisStr,
  };

  // Update cvId
  if (cvId && cvId !== "manual") {
    application.cvId = cvId;
  } else {
    application.cvId = undefined;
  }

  await application.save();

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
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "accepted", "rejected"].includes(status)) {
    return next(new AppError("Invalid status value", 400));
  }

  const application = await Application.findById(id);

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Only employer can update status
  const employer = await Employer.findById(application.employerId);
  if (employer.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this application", 403));
  }

  application.status = status;
  await application.save();

  // Send email notification to applicant
  const applicantEmail = application.applicantInfo.email;
  if (applicantEmail) {
    try {
      const statusMessage =
        status === "accepted"
          ? "Congratulations! Your application has been accepted!"
          : "Thank you for your application. Unfortunately, you have not been selected for this round.";

      await sendEmail({
        email: applicantEmail,
        subject: `Application Status Update`,
        message: `
Hi ${application.applicantInfo.fullName},

${statusMessage}

We appreciate your interest in our company.

Best regards,
The CV Editor Team
        `,
      });
    } catch (error) {
      console.error("Error sending status update email:", error);
    }
  }

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
  const { id } = req.params;

  const application = await Application.findById(id);

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Only applicant or employer can delete
  const isOwner = application.userId.toString() === req.user._id.toString();
  const employer = await Employer.findById(application.employerId);
  const isEmployer =
    employer && employer.userId.toString() === req.user._id.toString();

  if (!isOwner && !isEmployer) {
    return next(new AppError("Not authorized to delete this application", 403));
  }

  await Application.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Application deleted",
  });
});
