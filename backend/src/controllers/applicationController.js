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

  if (existingApplication) {
    return next(new AppError("You have already applied for this job.", 409));
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
    const extractedInfo = extractApplicantInfoFromParsedCV(
      parsedPdfAnalysis,
      req.user,
    );
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
    if (additionalInformation)
      normalizedProfile.additionalInformation = additionalInformation;
  } else {
    // Manual application - build normalized profile from form data
    normalizedProfile = buildNormalizedProfile({
      applicantInfo: {
        fullName:
          fullName ||
          (req.user.firstName
            ? `${req.user.firstName} ${req.user.lastName}`
            : "Candidate"),
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
  // FIX #5: Always run AI analysis in the background after application is saved.
  // For applicants: submit immediately without waiting for AI analysis.
  // For employers: use stored matchPercentage for ranking and filtering applicants.
  // Set matchPercentage to null initially - background job will fill it in.
  const percentageScore = null;
  const matchAnalysisStr = "";

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
      technicalSkillsMatch: 0,
      experienceMatch: 0,
      softSkillsMatch: 0,
      languagesMatch: 0,
      matchAnalysis: "Analysis pending...",
    },
    strengths: [],
    weaknesses: [],
    aiAnalysisPending: true,
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
      application: result.application._id,
    },
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
            <h3>Match Score</h3>
            <p style="color:#666;font-size:14px">Match analysis is running. The score will appear in your dashboard within a few moments.</p>
            <p>Log in to your dashboard to review this application and see the AI match analysis.</p>
          </div>
          <div class="footer"><p>© 2024 CV Editor. All rights reserved.</p></div>
        </div></body></html>`;
        try {
          await sendEmail({
            email: employer.company.contactEmail,
            subject: `New Application: ${normalizedProfile.fullName} for ${job.position}`,
            html: htmlEmail,
          });
          await Application.findByIdAndUpdate(application._id, {
            isNotified: true,
          });
        } catch (e) {
          console.error("Employer email error:", e);
        }
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
            <p style="color:#666;font-size:14px">Our AI is analyzing your profile for the best match score. Check your dashboard in a few moments to see the results!</p>
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
        } catch (e) {
          console.error("Applicant email error:", e);
        }
      }
    } catch (bgEmailErr) {
      console.error("[Background emails] Error:", bgEmailErr);
    }

    // ---- BACKGROUND AI (runs for ALL applications, updates score + text) ----
    try {
      if (req.file || skipAnalysis === "true" || skipAnalysis === true) {
        console.log(
          `[Background AI] Starting analysis for app ${application._id}`,
        );
        let aiAnalysis;
        let parsedBgAnalysis = null;

        if (req.file) {
          // Parse the PDF with AI and get real score + summary
          const raw = await analyzeApplicationCV(
            req.file.path,
            job.description || "",
          );
          try {
            parsedBgAnalysis = JSON.parse(raw);
          } catch (e) {
            /* ignore */
          }
          aiAnalysis = parsedBgAnalysis;
        } else if (!isManualApplication) {
          aiAnalysis = await generateAIMatchAnalysis(
            normalizedProfile,
            job,
            job._id,
            userId,
            "EXISTING_PROFILE",
          );
        } else {
          aiAnalysis = await generateAIMatchAnalysis(
            normalizedProfile,
            job,
            job._id,
            userId,
            "MANUAL_FORM",
          );
        }

        const bgUpdate = {
          aiAnalysisPending: false,
        };
        if (req.file && parsedBgAnalysis) {
          // AI read the actual PDF — use its own score
          bgUpdate.matchPercentage =
            parsedBgAnalysis.overall_fit_percentage ?? 0;
          bgUpdate["matchDetails.matchAnalysis"] =
            parsedBgAnalysis.recruiter_summary || "Analysis complete.";
          // Extract strengths and gaps (weaknesses) from AI response
          bgUpdate.strengths = parsedBgAnalysis.strengths || [];
          bgUpdate.weaknesses = (parsedBgAnalysis.gaps || []).map(
            (g) => g.gap || "",
          );
        } else if (aiAnalysis && !aiAnalysis.error) {
          bgUpdate.matchPercentage = aiAnalysis.overall_fit_percentage || 0;
          bgUpdate["matchDetails.matchAnalysis"] =
            aiAnalysis.recruiter_summary || "";
          bgUpdate.strengths = aiAnalysis.strengths || [];
          bgUpdate.weaknesses = (aiAnalysis.gaps || []).map((g) => g.gap || "");
        } else {
          bgUpdate["matchDetails.matchAnalysis"] =
            "Background AI analysis failed.";
          bgUpdate.strengths = [];
          bgUpdate.weaknesses = [];
        }

        await Application.findByIdAndUpdate(application._id, bgUpdate);
        console.log(`[Background AI] Completed for app ${application._id}`);
      }
    } catch (err) {
      console.error(`[Background AI] Error for app ${application._id}:`, err);
      await Application.findByIdAndUpdate(application._id, {
        "matchDetails.matchAnalysis":
          "Failed to analyze during background check.",
      });
    }
  });
});

// ================================== //
//    ANALYZE CV FOR ATS SCORE        //
// ================================== //
export const analyzeAtsScore = catchAsync(async (req, res, next) => {
  const { cvId } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!cvId) {
    return next(new AppError("CV ID is required", 400));
  }

  // Fetch the CV and verify ownership
  const cv = await CV.findById(cvId);
  if (!cv) {
    return next(new AppError("CV not found", 404));
  }

  if (cv.userId.toString() !== userId.toString()) {
    return next(new AppError("You are not authorized to analyze this CV", 403));
  }

  // Prepare CV data for ATS analysis
  const cvData = {
    fullName: cv.fullName || "",
    jobTitle: cv.jobTitle || "",
    summary: cv.summary || "",
    contact: {
      phone: cv.contact?.phone || "",
      email: cv.contact?.email || "",
      linkedin: cv.contact?.linkedin || "",
      github: cv.contact?.github || "",
    },
    address: {
      city: cv.address?.city || "",
      street: cv.address?.street || "",
    },
    experience: cv.experience || [],
    education: cv.education || [],
    technicalSkills: cv.technicalSkills || [],
    softSkills: cv.softSkills || [],
    languages: cv.language || [],
    certifications:
      cv.customSections
        ?.filter((s) => s.sectionType === "certifications")
        .flatMap((s) => s.items.map((item) => item.name)) || [],
  };

  try {
    // Call AI to analyze ATS score
    const aiResponse = await analyzeATSScore(cvData);

    // Parse JSON with safety wrapper - strip markdown fences and retry once
    let cleanedResponse = aiResponse;
    const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[1].trim();
      console.log("Stripped markdown fences from ATS score AI response");
    }

    let atsResult;
    try {
      atsResult = JSON.parse(cleanedResponse);
      console.log("Successfully parsed ATS score JSON on first attempt");
    } catch (e) {
      console.error(
        "Failed to parse ATS score JSON on first attempt:",
        e.message,
      );
      console.error("Raw AI response was:", aiResponse.substring(0, 500));

      // Retry: extract JSON from response
      try {
        const jsonStart = cleanedResponse.indexOf("{");
        const jsonEnd = cleanedResponse.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const extractedJson = cleanedResponse.substring(
            jsonStart,
            jsonEnd + 1,
          );
          atsResult = JSON.parse(extractedJson);
          console.log(
            "Successfully parsed ATS score JSON on retry (extracted JSON substring)",
          );
        }
      } catch (retryError) {
        console.error(
          "Failed to parse ATS score JSON on retry:",
          retryError.message,
        );
        return next(
          new AppError("Failed to analyze CV. Please try again later.", 500),
        );
      }
    }

    // Return ATS analysis result
    res.status(200).json({
      success: true,
      data: atsResult,
    });
  } catch (error) {
    console.error("ATS analysis error:", error);
    return next(
      new AppError(
        "Failed to analyze CV for ATS score. Please try again later.",
        500,
      ),
    );
  }
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
      const aiAnalysis = await analyzeApplicationCV(
        req.file.path,
        job.description || "",
      );
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
    const extractedInfo = extractApplicantInfoFromParsedCV(
      parsedPdfAnalysis,
      req.user,
    );
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
    if (additionalInformation)
      normalizedProfile.additionalInformation = additionalInformation;
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
        isManualApplication
          ? "MANUAL_FORM"
          : cvId
            ? "EXISTING_PROFILE"
            : "CV_UPLOAD",
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
