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
import { analyzeApplicationCV } from "../integrations/ai/openai.js";
import { sendEmail } from "../utils/email.js";
import {
  extractCertifications,
  calculateExperienceYears,
  buildNormalizedProfile,
  extractApplicantInfoFromParsedCV,
} from "../utils/profileNormalizer.js";

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
  let normalizedProfile;
  let parsedPdfAnalysis = null;

  // Handle uploaded PDF file - use OpenAI File API directly (no pdf-parse)
  if (req.file) {
    // Use OpenAI File API to analyze PDF directly
    const aiAnalysis = await analyzeApplicationCV(req.file.path, job?.description || "");
    try {
      parsedPdfAnalysis = JSON.parse(aiAnalysis);
    } catch (e) {
      console.error("Failed to parse AI analysis JSON:", e);
      parsedPdfAnalysis = null;
    }

    // Extract applicant info from parsed CV using canonical normalizer
    const extractedInfo = extractApplicantInfoFromParsedCV(parsedPdfAnalysis, req.user);

    // Build normalized profile for scoring
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: extractedInfo,
      experience: extractedInfo.experience || [],
      education: extractedInfo.education || [],
      customSections: [],
    });

    cv = {
      _id: "temp_" + Date.now(),
      userId,
      fullName: normalizedProfile.fullName,
      contact: {
        email: normalizedProfile.email,
        phone: normalizedProfile.phone,
      },
      summary: normalizedProfile.summary,
      technicalSkills: normalizedProfile.technicalSkills,
      softSkills: normalizedProfile.softSkills,
      language: normalizedProfile.languages,
      certifications: normalizedProfile.certifications,
      pdfPath: req.file.path,
    };
  } else {
    // Handle existing CV - use canonical normalization
    cv = await CV.findById(cvId);
    if (!cv) {
      return next(new AppError("CV not found", 404));
    }
    if (cv.userId.toString() !== userId.toString()) {
      return next(new AppError("Not authorized to use this CV", 403));
    }

    // Build normalized profile from existing CV
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        fullName: cv.fullName,
        email: cv.contact?.email,
        phone: cv.contact?.phone,
        technicalSkills: cv.technicalSkills,
        softSkills: cv.softSkills,
        languages: cv.language,
      },
      experience: cv.experience || [],
      education: cv.education || [],
      customSections: cv.customSections || [],
      cvData: cv,
    });
  }

  // Check if job exists
  const job = await Job.findById(jobId).populate("employerId");
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.status !== "OPEN") {
    return next(new AppError("This job is no longer open", 400));
  }

  // CANONICAL SCORING: Always use calculateMatchPercentage with normalized profile
  // AI is used for narrative/summary ONLY, not for the percentage score
  const matchResult = calculateMatchPercentage(normalizedProfile, job);
  let percentageScore = matchResult.percentage;
  let strengths = [];
  let weaknesses = [];
  let matchAnalysisStr = "";

  // Generate AI analysis for narrative content only (strengths, weaknesses, summary)
  // The percentage score remains canonical regardless of AI output
  if (req.file) {
    if (parsedPdfAnalysis) {
      strengths = parsedPdfAnalysis.strengths || [];
      weaknesses = (parsedPdfAnalysis.gaps || []).map(g => `${g.severity} Gap: ${g.gap} - ${g.suggestion}`);
      matchAnalysisStr = parsedPdfAnalysis.recruiter_summary || "";
    }
  } else {
    try {
      const aiAnalysis = await generateAIMatchAnalysis(
        normalizedProfile,
        job,
        job._id,
        req.user._id,
        "EXISTING_PROFILE"
      );

      if (aiAnalysis && !aiAnalysis.error) {
        strengths = aiAnalysis.strengths || [];
        weaknesses = (aiAnalysis.gaps || []).map(g => `${g.severity} Gap: ${g.gap} - ${g.suggestion}`);
        matchAnalysisStr = aiAnalysis.recruiter_summary || "";
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      matchAnalysisStr = "Analysis generation failed";
    }
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
        fullName: normalizedProfile.fullName || "Candidate",
        email: normalizedProfile.email || "",
        phone: normalizedProfile.phone || "",
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
    linkedin,
    portfolioUrl,
    yearsOfExperience,
    technicalSkills,
    softSkills,
    languages,
    certifications,
    education,
    summary,
    additionalInformation,
    skipAnalysis,
  } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!jobId) {
    return next(new AppError("Job ID is required", 400));
  }

  let cvData = null;
  let isManualApplication = cvId === "manual" || !cvId;
  let applicationMethod = "manual";
  let rawCvText = null;
  let parsedPdfAnalysis = null;

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
    // Use OpenAI File API directly - no pdf-parse needed
    rawCvText = null;
    try {
      const aiAnalysis = await analyzeApplicationCV(req.file.path, "");
      try {
        parsedPdfAnalysis = JSON.parse(aiAnalysis);
      } catch (e) {
        parsedPdfAnalysis = null;
      }
    } catch (err) {
      console.error("PDF analysis failed", err);
    }
  }

  // Removed strict validation block for missing applicantInfo.fullName

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
    // Return a non-error response so frontend can show a friendly notice without 409 conflicts.
    return res.status(200).json({
      success: true,
      message: "You have already applied for this job.",
      data: {
        alreadyApplied: true,
        applicationId: existingApplication._id,
        status: existingApplication.status,
      },
    });
  }

  // Prepare applicant info - use canonical normalization for all paths
  let normalizedProfile;
  let rawCvTextForAI = null;

  if (cvData) {
    // Existing CV - use canonical normalization
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        fullName: cvData.fullName,
        email: cvData.contact?.email,
        phone: cvData.contact?.phone,
        technicalSkills: cvData.technicalSkills,
        softSkills: cvData.softSkills,
        languages: cvData.language,
        certifications,
      },
      experience: cvData.experience || [],
      education: cvData.education || [],
      customSections: cvData.customSections || [],
      cvData: cvData,
    });
  } else if (parsedPdfAnalysis?.cvData) {
    // Uploaded PDF - extract and normalize
    const extractedInfo = extractApplicantInfoFromParsedCV(parsedPdfAnalysis, req.user);
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        ...extractedInfo,
        certifications: extractedInfo.certifications || certifications || [],
      },
      experience: extractedInfo.experience || [],
      education: extractedInfo.education || [],
      customSections: [],
    });
    // Merge manual form data if provided
    if (fullName) normalizedProfile.fullName = fullName;
    if (email) normalizedProfile.email = email;
    if (phone) normalizedProfile.phone = phone;
    if (linkedin) normalizedProfile.linkedin = linkedin;
    if (portfolioUrl) normalizedProfile.portfolioUrl = portfolioUrl;
    if (summary) normalizedProfile.summary = summary;
    if (additionalInformation) normalizedProfile.additionalInformation = additionalInformation;
  } else {
    // Manual application - build normalized profile from form data
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        fullName: fullName || (req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : "Candidate"),
        email: email || req.user.email || "",
        phone: phone || "",
        linkedin: linkedin || "",
        portfolioUrl: portfolioUrl || "",
        summary: summary || "",
        technicalSkills: technicalSkills || [],
        softSkills: softSkills || [],
        languages: languages || [],
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        certifications: certifications || [],
        additionalInformation: additionalInformation || "",
      },
      education: (education || []).map((e) => ({
        institutionName: e?.institutionName || "",
        certification: e?.certification || "",
        durationFrom: e?.durationFrom || "",
        durationTo: e?.durationTo || "",
        summary: e?.summary || "",
      })),
      customSections: [],
    });
  }

  // CANONICAL SCORING: Always use calculateMatchPercentage with normalized profile
  // AI is used for narrative/summary ONLY, not for the percentage score
  const matchResult = calculateMatchPercentage(normalizedProfile, job);
  let percentageScore = matchResult.percentage;
  let matchAnalysisStr = "";

  if (skipAnalysis === "true" || skipAnalysis === true) {
    // For skipAnalysis, return canonical score immediately with placeholder message
    // Background job will update the text analysis only, not the percentage
    percentageScore = matchResult.percentage;
    matchAnalysisStr = "AI match score is currently pending background analysis. We will notify you once it's complete.";
  } else if (req.file) {
    // Uploaded PDF - use AI for narrative only, keep canonical score
    if (parsedPdfAnalysis) {
      matchAnalysisStr = parsedPdfAnalysis.recruiter_summary || "";
    } else {
      matchAnalysisStr = "Analysis unavailable for uploaded PDF.";
    }
  } else if (!isManualApplication) {
    // Existing CV - use AI for narrative only
    try {
      const aiAnalysis = await generateAIMatchAnalysis(
        normalizedProfile,
        job,
        job._id,
        userId,
        "EXISTING_PROFILE"
      );

      if (aiAnalysis && !aiAnalysis.error) {
        matchAnalysisStr = aiAnalysis.recruiter_summary || "";
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      matchAnalysisStr = "Analysis generation failed";
    }
  }

  // Create application with normalized profile data
  const applicationData = {
    userId,
    jobId,
    employerId: job.employerId._id,
    applicantInfo: {
      fullName: normalizedProfile.fullName,
      email: normalizedProfile.email,
      phone: normalizedProfile.phone,
      linkedin: normalizedProfile.linkedin || "",
      portfolioUrl: normalizedProfile.portfolioUrl || "",
      summary: normalizedProfile.summary,
      technicalSkills: normalizedProfile.technicalSkills,
      softSkills: normalizedProfile.softSkills,
      yearsOfExperience: normalizedProfile.yearsOfExperience,
      languages: normalizedProfile.languages,
      additionalInformation: normalizedProfile.additionalInformation || "",
      certifications: normalizedProfile.certifications,
      education: normalizedProfile.education,
    },
    matchPercentage: percentageScore,
    matchDetails: {
      ...matchResult.breakdown,
      matchAnalysis: matchAnalysisStr,
    },
    applicationMethod,
  };

  if (req.file) {
    applicationData.cvFile = {
      filename: req.file.originalname,
      path: req.file.path,
    };
  }

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
            .header { background: linear-gradient(135deg, #4ecdc4, #1a1a2e); color: white; padding: 20px; text-align: center; }
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
              <p><strong>Name:</strong> ${normalizedProfile.fullName}</p>
              <p><strong>Email:</strong> ${normalizedProfile.email}</p>
              <p><strong>Phone:</strong> ${normalizedProfile.phone}</p>
              ${normalizedProfile.linkedin ? `<p><strong>LinkedIn:</strong> ${normalizedProfile.linkedin}</p>` : ""}

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
                <p>${matchAnalysisStr}</p>
              </div>

              <p><strong>Summary:</strong> ${normalizedProfile.summary}</p>

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
        subject: `New Application: ${normalizedProfile.fullName} for ${job.position}`,
        html: htmlEmail,
      });
      application.isNotified = true;
      await application.save();
    } catch (error) {
      console.error("Error sending email to employer:", error);
    }
  }

  // Send HTML confirmation email to applicant
  if (normalizedProfile.email) {
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
              <p>Hi ${normalizedProfile.fullName},</p>
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
        email: normalizedProfile.email,
        subject: `Application Confirmation: ${normalizedProfile.fullName} - ${job.position}`,
        html: confirmationEmail,
      });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
    }
  }

  // Send response immediately
  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: {
      application: application._id,
    },
    matchPercentage: percentageScore,
  });
  
  // Background AI generation for skipAnalysis
  // NOTE: Background job updates text analysis ONLY, not the percentage score
  if (skipAnalysis === "true" || skipAnalysis === true) {
    setImmediate(async () => {
      try {
        console.log(`[Background AI] Starting analysis for app ${application._id}`);
        let aiAnalysis;

        if (req.file) {
          aiAnalysis = await analyzeApplicationCV(req.file.path, job.description || "");
        } else if (!isManualApplication) {
          aiAnalysis = await generateAIMatchAnalysis(
            normalizedProfile,
            job,
            job._id,
            userId,
            "EXISTING_PROFILE"
          );
        } else {
          aiAnalysis = await generateAIMatchAnalysis(
            normalizedProfile,
            job,
            job._id,
            userId,
            "MANUAL_FORM"
          );
        }

        let newAnalysisStr = "";

        if (aiAnalysis && !aiAnalysis.error) {
          // Keep canonical score, only update narrative text
          newAnalysisStr = aiAnalysis.recruiter_summary || "";
        } else {
          newAnalysisStr = "Background AI Analysis failed.";
        }

        await Application.findByIdAndUpdate(application._id, {
          "matchDetails.matchAnalysis": newAnalysisStr
        });
        console.log(`[Background AI] Completed for app ${application._id}`);
      } catch (err) {
        console.error(`[Background AI] Error for app ${application._id}:`, err);
        await Application.findByIdAndUpdate(application._id, {
          "matchDetails.matchAnalysis": "Failed to analyze during background check."
        });
      }
    });
  }
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
//   GET APPLICATIONS FOR A JOB       //
// ================================== //
export const getApplicationsByJob = catchAsync(async (req, res, next) => {
  const employer = await Employer.findOne({ userId: req.user._id });
  const { jobId } = req.params;

  if (!employer) {
    return res.status(404).json({
      success: false,
      message: "Employer profile not found",
    });
  }

  // Ensure the job belongs to this employer
  const job = await Job.findOne({ _id: jobId, employerId: employer._id });
  if (!job) {
    return next(new AppError("Job not found or not owned by you", 404));
  }

  const applications = await Application.find({ jobId })
    .populate("userId", "firstName lastName email")
    .populate("cvId")
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
    linkedin,
    portfolioUrl,
    yearsOfExperience,
    technicalSkills,
    softSkills,
    languages,
    certifications,
    education,
    summary,
    additionalInformation,
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
  let isManualApplication = (cvId === "manual" || !cvId) && !req.file;
  let parsedPdfAnalysis = null;

  // If using CV, validate it exists and belongs to user
  if (!req.file && cvId && cvId !== "manual") {
    const cv = await CV.findById(cvId);
    if (!cv) {
      return next(new AppError("CV not found", 404));
    }
    if (cv.userId.toString() !== userId.toString()) {
      return next(new AppError("Not authorized to use this CV", 403));
    }
    cvData = cv;
    isManualApplication = false;
  } else if (req.file) {
    isManualApplication = false;
    application.applicationMethod = "uploadPdf";
    try {
      const aiAnalysis = await analyzeApplicationCV(req.file.path, job.description || "");
      parsedPdfAnalysis = JSON.parse(aiAnalysis);
    } catch (err) {
      console.error("PDF analysis failed", err);
    }
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

  // Prepare applicant info - use canonical normalization for all paths
  let normalizedProfile;

  if (cvData) {
    // Existing CV - use canonical normalization
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        fullName: cvData.fullName,
        email: cvData.contact?.email,
        phone: cvData.contact?.phone,
        technicalSkills: cvData.technicalSkills,
        softSkills: cvData.softSkills,
        languages: cvData.language,
        certifications,
      },
      experience: cvData.experience || [],
      education: cvData.education || [],
      customSections: cvData.customSections || [],
      cvData: cvData,
    });
  } else if (parsedPdfAnalysis?.cvData) {
    // Uploaded PDF - extract and normalize
    const extractedInfo = extractApplicantInfoFromParsedCV(parsedPdfAnalysis, req.user);
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        ...extractedInfo,
        certifications: extractedInfo.certifications || certifications || [],
      },
      experience: extractedInfo.experience || [],
      education: extractedInfo.education || [],
      customSections: [],
    });
    // Merge manual form data if provided
    if (fullName) normalizedProfile.fullName = fullName;
    if (email) normalizedProfile.email = email;
    if (phone) normalizedProfile.phone = phone;
    if (linkedin) normalizedProfile.linkedin = linkedin;
    if (portfolioUrl) normalizedProfile.portfolioUrl = portfolioUrl;
    if (summary) normalizedProfile.summary = summary;
    if (additionalInformation) normalizedProfile.additionalInformation = additionalInformation;
  } else {
    // Manual application - build normalized profile from form data
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        fullName: fullName || "",
        email: email || "",
        phone: phone || "",
        linkedin: linkedin || "",
        portfolioUrl: portfolioUrl || "",
        summary: summary || "",
        technicalSkills: technicalSkills || [],
        softSkills: softSkills || [],
        languages: languages || [],
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        certifications: certifications || [],
        additionalInformation: additionalInformation || "",
      },
      education: (education || []).map((e) => ({
        institutionName: e?.institutionName || "",
        certification: e?.certification || "",
        durationFrom: e?.durationFrom || "",
        durationTo: e?.durationTo || "",
        summary: e?.summary || "",
      })),
      customSections: [],
    });
  }

  // Recalculate match percentage using canonical scorer
  const { skipAnalysis } = req.body;
  const matchResult = calculateMatchPercentage(normalizedProfile, job);
  let percentageScore = matchResult.percentage;
  let matchAnalysisStr = "";

  // Only run AI analysis if explicitly requested (skipAnalysis !== true)
  // AI provides narrative only, not the percentage score
  if (skipAnalysis !== true && skipAnalysis !== "true") {
    try {
      const aiAnalysis = await generateAIMatchAnalysis(
        normalizedProfile,
        job,
        job._id,
        userId,
        isManualApplication ? "MANUAL_FORM" : (cvId ? "EXISTING_PROFILE" : "CV_UPLOAD")
      );

      if (aiAnalysis && !aiAnalysis.error) {
        matchAnalysisStr = aiAnalysis.recruiter_summary || "";
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      matchAnalysisStr = "Analysis generation failed";
    }
  } else {
    // Preserve existing match analysis when skipping
    matchAnalysisStr = application.matchDetails?.matchAnalysis || "";
  }

  // Update application with normalized profile
  application.applicantInfo = {
    fullName: normalizedProfile.fullName,
    email: normalizedProfile.email,
    phone: normalizedProfile.phone,
    linkedin: normalizedProfile.linkedin || "",
    portfolioUrl: normalizedProfile.portfolioUrl || "",
    summary: normalizedProfile.summary,
    technicalSkills: normalizedProfile.technicalSkills,
    softSkills: normalizedProfile.softSkills,
    yearsOfExperience: normalizedProfile.yearsOfExperience,
    languages: normalizedProfile.languages,
    additionalInformation: normalizedProfile.additionalInformation || "",
    certifications: normalizedProfile.certifications,
    education: normalizedProfile.education,
  };
  application.matchPercentage = percentageScore;
  application.matchDetails = {
    ...matchResult.breakdown,
    matchAnalysis: matchAnalysisStr,
  };

  // Update cvId
  if (cvId && cvId !== "manual" && !req.file) {
    application.cvId = cvId;
  } else {
    application.cvId = undefined;
  }

  if (req.file) {
    application.cvFile = {
      filename: req.file.originalname,
      path: req.file.path,
    };
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
