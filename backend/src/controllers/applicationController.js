import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import CV from "../models/CV.js";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Employer from "../models/Employer.js";
import User from "../models/User.js";
import { analyzeCvForJob } from "../services/applications/commands/analyzeCvForJob.js";
import { createApplication } from "../services/applications/commands/createApplication.js";
import { updateApplication as updateApplicationCommand } from "../services/applications/commands/updateApplication.js";
import { updateApplicationStatus as updateApplicationStatusCommand } from "../services/applications/commands/updateApplicationStatus.js";
import { deleteApplication as deleteApplicationCommand } from "../services/applications/commands/deleteApplication.js";
import { getMyApplications as getMyApplicationsQuery } from "../services/applications/queries/getMyApplications.js";
import { getEmployerApplications as getEmployerApplicationsQuery } from "../services/applications/queries/getEmployerApplications.js";
import { getApplicationsByJob as getApplicationsByJobQuery } from "../services/applications/queries/getApplicationsByJob.js";
import { getApplicationById as getApplicationByIdQuery } from "../services/applications/queries/getApplicationById.js";
import {
  analyzeATSScore,
  analyzeApplicationCV,
} from "../integrations/ai/openai.js";
import {
  buildNormalizedProfile,
  extractApplicantInfoFromParsedCV,
} from "../utils/profileNormalizer.js";
import {
  calculateMatchPercentage,
  generateAIMatchAnalysis,
} from "../services/matching/matchingService.js";
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

  // FIX #3: Check if user already applied for this job
  if (result.alreadyApplied) {
    return next(new AppError("You have already applied for this job.", 409));
  }

  // Respond immediately with created application
  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: {
      application: result.application._id,
      matchPercentage: result.matchPercentage,
    },
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
  // FIX #4: Declare ALL variables at the top before any conditional logic
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
    skipAnalysis,
  } = req.body;
  const userId = req.user._id;
  const { id } = req.params;

  let cvData = null;
  let isManualApplication = false;
  let parsedPdfAnalysis = null;
  let applicationMethod = null;

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

  // FIX #4: Handle PDF upload - set method and process file
  if (req.file) {
    applicationMethod = "uploadPdf";
    isManualApplication = false;
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
  // Handle existing CV selection
  else if (cvId && cvId !== "manual") {
    applicationMethod = "existingCv";
    isManualApplication = false;
    const cv = await CV.findById(cvId);
    if (!cv) {
      return next(new AppError("CV not found", 404));
    }
    if (cv.userId.toString() !== userId.toString()) {
      return next(new AppError("Not authorized to use this CV", 403));
    }
    cvData = cv;
  }
  // Handle manual application
  else {
    applicationMethod = "manual";
    isManualApplication = true;
    if (!fullName) {
      return next(
        new AppError(
          "Applicant information is required for manual application",
          400,
        ),
      );
    }
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

  // Update application with normalized profile and new method
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
  // FIX #4: Update applicationMethod to reflect newly chosen method
  application.applicationMethod = applicationMethod;

  // FIX #4: Update cvId if using existing CV, clear it otherwise
  if (cvId && cvId !== "manual" && !req.file) {
    application.cvId = cvId;
  } else {
    application.cvId = undefined;
  }

  // FIX #4: Handle PDF file update
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
