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

  // Fetch job FIRST so we can pass the description to the AI for uploaded PDFs
  const job = await Job.findById(jobId).populate("employerId");
  if (!job) {
    return next(new AppError("Job not found", 404));
  }

  if (job.status !== "OPEN") {
    return next(new AppError("This job is no longer open", 400));
  }

  let cv;
  let normalizedProfile;
  let parsedPdfAnalysis = null;

  // Handle uploaded PDF file - use OpenAI File API directly (no pdf-parse)
  if (req.file) {
    // Now job.description is available — pass it so the AI understands the target role
    const aiAnalysis = await analyzeApplicationCV(req.file.path, job.description || "");
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

  // SCORING:
  // - For PDF uploads: trust the AI's overall_fit_percentage directly — it understands context better
  //   than our rigid keyword-based formula which can give 15% even for a perfect CV.
  // - For existing CVs: use the canonical scorer (we have clean structured skill arrays).
  const matchResult = calculateMatchPercentage(normalizedProfile, job);
  let percentageScore;
  let strengths = [];
  let weaknesses = [];
  let matchAnalysisStr = "";

  if (req.file) {
    if (parsedPdfAnalysis) {
      // Use the AI's own fit score — it did a full semantic read of the PDF vs. job description
      percentageScore = parsedPdfAnalysis.overall_fit_percentage ?? matchResult.percentage;
      strengths = parsedPdfAnalysis.strengths || [];
      weaknesses = (parsedPdfAnalysis.gaps || []).map(g => `${g.severity} Gap: ${g.gap} - ${g.suggestion}`);
      matchAnalysisStr = parsedPdfAnalysis.recruiter_summary || "";
    } else {
      percentageScore = matchResult.percentage;
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
        percentageScore = aiAnalysis.overall_fit_percentage ?? matchResult.percentage;
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
    const ext = extractStrengthsWeaknesses(matchAnalysisStr, matchResult.breakdown);
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
    // Only run the expensive AI parse when we actually need the CV data (not skipAnalysis).
    // When skipAnalysis=true the background job will do the AI work after the response is sent.
    if (skipAnalysis !== "true" && skipAnalysis !== true) {
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

  // SCORING:
  // - PDF with skipAnalysis: don't show a fake score. Set null so UI shows pending.
  //   The background job will calculate the real score from the AI analysis.
  // - PDF without skipAnalysis: use AI's own fit percentage (already parsed above).
  // - Existing CV / Manual: use canonical scorer.
  const matchResult = calculateMatchPercentage(normalizedProfile, job);
  let percentageScore;
  let matchAnalysisStr = "";

  if (skipAnalysis === "true" || skipAnalysis === true) {
    if (req.file) {
      // Pending — background job will set the real score
      percentageScore = null;
      matchAnalysisStr = "Analysis pending...";
    } else {
      percentageScore = matchResult.percentage;
      matchAnalysisStr = "AI analysis is running in the background. Check back shortly.";
    }
  } else if (req.file && parsedPdfAnalysis) {
    // Trust the AI's own score for PDF uploads
    percentageScore = parsedPdfAnalysis.overall_fit_percentage ?? matchResult.percentage;
    matchAnalysisStr = parsedPdfAnalysis.recruiter_summary || "";
  } else if (!isManualApplication) {
    try {
      const aiAnalysis = await generateAIMatchAnalysis(
        normalizedProfile,
        job,
        job._id,
        userId,
        "EXISTING_PROFILE"
      );
      if (aiAnalysis && !aiAnalysis.error) {
        percentageScore = aiAnalysis.overall_fit_percentage ?? matchResult.percentage;
        matchAnalysisStr = aiAnalysis.recruiter_summary || "";
      } else {
        percentageScore = matchResult.percentage;
      }
    } catch (error) {
      console.error("AI analysis error:", error);
      percentageScore = matchResult.percentage;
      matchAnalysisStr = "Analysis generation failed";
    }
  } else {
    percentageScore = matchResult.percentage;
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

  // Respond immediately — emails and background AI run after the response
  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: {
      application: application._id,
    },
    matchPercentage: percentageScore,
  });
  
  // Fire-and-forget: emails + background AI run AFTER the response is already sent
  setImmediate(async () => {
    // ---- EMAILS ----
    try {
      const employer = await Employer.findById(job.employerId);
      if (employer?.company?.contactEmail) {
        const htmlEmail = `<!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;color:#333}
          .container{max-width:600px;margin:0 auto}
          .header{background:linear-gradient(135deg,#4ecdc4,#1a1a2e);color:white;padding:20px;text-align:center}
          .content{padding:20px;background:#f8f9fa}
          .match-score{font-size:24px;font-weight:bold;color:#4ecdc4;text-align:center;margin:20px 0}
          .breakdown-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}
          .breakdown-value{color:#f7b731;font-weight:bold}
          .footer{text-align:center;padding:20px;color:#999;font-size:12px}
        </style></head><body><div class="container">
          <div class="header"><h1>New Application Received</h1></div>
          <div class="content">
            <p>Hi ${employer?.company?.name || "Employer"},</p>
            <p>New application for <strong>${job.position}</strong>.</p>
            <h3>Candidate</h3>
            <p><strong>Name:</strong> ${normalizedProfile.fullName}</p>
            <p><strong>Email:</strong> ${normalizedProfile.email}</p>
            <p><strong>Phone:</strong> ${normalizedProfile.phone}</p>
            ${normalizedProfile.linkedin ? `<p><strong>LinkedIn:</strong> ${normalizedProfile.linkedin}</p>` : ""}
            <h3>Match</h3>
            <div class="match-score">${percentageScore}% Match</div>
            <div>
              <div class="breakdown-row"><span>Technical Skills</span><span class="breakdown-value">${matchResult.breakdown.technicalSkillsMatch}%</span></div>
              <div class="breakdown-row"><span>Experience</span><span class="breakdown-value">${matchResult.breakdown.experienceMatch}%</span></div>
              <div class="breakdown-row"><span>Soft Skills</span><span class="breakdown-value">${matchResult.breakdown.softSkillsMatch}%</span></div>
              <div class="breakdown-row"><span>Languages</span><span class="breakdown-value">${matchResult.breakdown.languagesMatch}%</span></div>
            </div>
            <p>Log in to your dashboard to review this application.</p>
          </div>
          <div class="footer"><p>© 2024 CV Editor. All rights reserved.</p></div>
        </div></body></html>`;
        try {
          await sendEmail({
            email: employer.company.contactEmail,
            subject: `New Application: ${normalizedProfile.fullName} for ${job.position}`,
            html: htmlEmail,
          });
          await Application.findByIdAndUpdate(application._id, { isNotified: true });
        } catch (e) { console.error("Employer email error:", e); }
      }

      if (normalizedProfile.email) {
        const confirmEmail = `<!DOCTYPE html><html><head><style>
          body{font-family:Arial,sans-serif;color:#333}
          .container{max-width:600px;margin:0 auto}
          .header{background:linear-gradient(135deg,#4ecdc4,#1a1a2e);color:white;padding:20px;text-align:center}
          .content{padding:20px;background:#f8f9fa}
          .footer{text-align:center;padding:20px;color:#999;font-size:12px}
          .button{display:inline-block;padding:10px 20px;background:#f7b731;color:#000;text-decoration:none;margin:10px 0;border-radius:4px}
        </style></head><body><div class="container">
          <div class="header"><h1>Application Submitted!</h1></div>
          <div class="content">
            <p>Hi ${normalizedProfile.fullName},</p>
            <p>Your application for <strong>${job.position}</strong> was submitted successfully.</p>
            <p style="font-size:28px;text-align:center;color:#f7b731;font-weight:bold">${percentageScore}%</p>
            <p><strong>Title:</strong> ${job.position} | <strong>Location:</strong> ${job.workSite}</p>
            <p style="text-align:center"><a href="${process.env.FRONTEND_URL}/employee/applications" class="button">View My Applications</a></p>
            <p>Best regards,<br>The CV Editor Team</p>
          </div>
          <div class="footer"><p>© 2024 CV Editor. All rights reserved.</p></div>
        </div></body></html>`;
        try {
          await sendEmail({
            email: normalizedProfile.email,
            subject: `Application Confirmation: ${normalizedProfile.fullName} - ${job.position}`,
            html: confirmEmail,
          });
        } catch (e) { console.error("Applicant email error:", e); }
      }
    } catch (bgEmailErr) {
      console.error("[Background emails] Error:", bgEmailErr);
    }

    // ---- BACKGROUND AI (runs for ALL applications, updates score + text) ----
    try {
      if (req.file || (skipAnalysis === "true" || skipAnalysis === true)) {
        console.log(`[Background AI] Starting analysis for app ${application._id}`);
        let aiAnalysis;
        let parsedBgAnalysis = null;

        if (req.file) {
          // Parse the PDF with AI and get real score + summary
          const raw = await analyzeApplicationCV(req.file.path, job.description || "");
          try { parsedBgAnalysis = JSON.parse(raw); } catch (e) { /* ignore */ }
          aiAnalysis = parsedBgAnalysis;
        } else if (!isManualApplication) {
          aiAnalysis = await generateAIMatchAnalysis(normalizedProfile, job, job._id, userId, "EXISTING_PROFILE");
        } else {
          aiAnalysis = await generateAIMatchAnalysis(normalizedProfile, job, job._id, userId, "MANUAL_FORM");
        }

        const bgUpdate = {};
        if (req.file && parsedBgAnalysis) {
          // AI read the actual PDF — use its own score
          bgUpdate.matchPercentage = parsedBgAnalysis.overall_fit_percentage ?? matchResult.percentage;
          bgUpdate["matchDetails.matchAnalysis"] = parsedBgAnalysis.recruiter_summary || "Analysis complete.";
        } else if (aiAnalysis && !aiAnalysis.error) {
          bgUpdate["matchDetails.matchAnalysis"] = aiAnalysis.recruiter_summary || "";
        } else {
          bgUpdate["matchDetails.matchAnalysis"] = "Background AI analysis failed.";
        }

        await Application.findByIdAndUpdate(application._id, bgUpdate);
        console.log(`[Background AI] Completed for app ${application._id}`);
      }
    } catch (err) {
      console.error(`[Background AI] Error for app ${application._id}:`, err);
      await Application.findByIdAndUpdate(application._id, {
        "matchDetails.matchAnalysis": "Failed to analyze during background check.",
      });
    }
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
