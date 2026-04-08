/**
 * Canonical Profile Normalizer
 *
 * Provides a single source of truth for extracting and normalizing applicant profile data
 * from various sources (existing CV, uploaded PDF, manual form) to ensure consistent scoring.
 *
 * Used by:
 * - POST /applications/analyze-cv
 * - POST /applications
 * - PATCH /applications/:id
 * - POST /cvs/:id/recommend-jobs
 */

/**
 * Extract all certifications from multiple sources
 * Sources (in priority order):
 * 1. applicantInfo.certifications (explicit array)
 * 2. education[].certification (from CV education entries)
 * 3. customSections with sectionType="certifications"
 *
 * @param {Object} applicantInfo - Raw applicant data
 * @param {Array} education - Education entries
 * @param {Array} customSections - Custom sections from CV
 * @returns {Array<string>} Deduplicated list of certifications
 */
export const extractCertifications = (applicantInfo, education = [], customSections = []) => {
  const certifications = new Set();

  // 1. Explicit certifications array from applicantInfo
  if (applicantInfo?.certifications && Array.isArray(applicantInfo.certifications)) {
    applicantInfo.certifications
      .filter(c => c && typeof c === 'string' && c.trim())
      .forEach(c => certifications.add(c.trim()));
  }

  // 2. Certifications from education entries
  if (Array.isArray(education)) {
    education
      .map(e => e?.certification)
      .filter(c => c && typeof c === 'string' && c.trim())
      .forEach(c => certifications.add(c.trim()));
  }

  // 3. Certifications from custom sections
  if (Array.isArray(customSections)) {
    customSections
      .filter(s => s?.sectionType === 'certifications' && Array.isArray(s.items))
      .flatMap(s => s.items)
      .map(item => item?.name || item?.description)
      .filter(c => c && typeof c === 'string' && c.trim())
      .forEach(c => certifications.add(c.trim()));
  }

  return Array.from(certifications);
};

/**
 * Calculate years of experience from various sources
 *
 * @param {Object} applicantInfo - Applicant data with yearsOfExperience
 * @param {Array} experience - Experience entries with durationFrom/durationTo or duration
 * @returns {number} Total years of experience
 */
export const calculateExperienceYears = (applicantInfo, experience = []) => {
  // 1. Use explicit yearsOfExperience if provided
  if (applicantInfo?.yearsOfExperience !== undefined && applicantInfo.yearsOfExperience !== null) {
    const parsed = parseFloat(applicantInfo.yearsOfExperience);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  // 2. Calculate from experience entries
  let totalYears = 0;

  for (const exp of experience) {
    // Try duration field first (legacy number field)
    if (exp.duration !== undefined && exp.duration !== null) {
      const parsed = parseFloat(exp.duration);
      if (!isNaN(parsed) && parsed >= 0) {
        totalYears += parsed;
        continue;
      }
    }

    // Calculate from durationFrom/durationTo
    const from = exp.durationFrom;
    const to = exp.durationTo;

    if (from) {
      const fromYear = parseInt(from.substring(0, 4), 10);
      const toYear = to ? parseInt(to.substring(0, 4), 10) : new Date().getFullYear();

      if (!isNaN(fromYear) && !isNaN(toYear) && toYear >= fromYear) {
        totalYears += toYear - fromYear;
      }
    }
  }

  return totalYears;
};

/**
 * Build normalized applicant profile for scoring
 *
 * @param {Object} options
 * @param {Object} options.applicantInfo - Raw applicant info
 * @param {Array} options.experience - Experience entries
 * @param {Array} options.education - Education entries
 * @param {Array} options.customSections - Custom sections
 * @param {Object} options.cvData - Optional CV data for fallback
 * @returns {Object} Normalized profile for scoring
 */
export const buildNormalizedProfile = ({
  applicantInfo,
  experience = [],
  education = [],
  customSections = [],
  cvData = null,
}) => {
  const certifications = extractCertifications(applicantInfo, education, customSections);
  const yearsOfExperience = calculateExperienceYears(applicantInfo, experience);

  return {
    fullName: applicantInfo?.fullName || cvData?.fullName || 'Candidate',
    email: applicantInfo?.email || cvData?.contact?.email || '',
    phone: applicantInfo?.phone || cvData?.contact?.phone || '',
    summary: applicantInfo?.summary || cvData?.summary || '',
    technicalSkills: applicantInfo?.technicalSkills || cvData?.technicalSkills || [],
    softSkills: applicantInfo?.softSkills || cvData?.softSkills || [],
    languages: applicantInfo?.languages || cvData?.language || [],
    yearsOfExperience,
    certifications,
    education: Array.isArray(education) ? education : [],
    experience: Array.isArray(experience) ? experience : [],
  };
};

/**
 * Extract applicant info from uploaded CV data
 * Used when processing uploaded PDFs that have been parsed by AI
 *
 * @param {Object} parsedAnalysis - AI-parsed CV data
 * @param {Object} user - Authenticated user for fallback
 * @returns {Object} Extracted applicant info
 */
export const extractApplicantInfoFromParsedCV = (parsedAnalysis, user = null) => {
  const cvData = parsedAnalysis?.cvData || {};

  return {
    fullName: parsedAnalysis?.candidate_name ||
              cvData?.jobTitle ||
              (user?.firstName ? `${user.firstName} ${user.lastName}`.trim() : 'Uploaded CV'),
    email: cvData?.contact?.email || '',
    phone: cvData?.contact?.phone || '',
    linkedin: cvData?.contact?.linkedin || '',
    github: cvData?.contact?.github || '',
    summary: cvData?.summary || '',
    technicalSkills: cvData?.technicalSkills || [],
    softSkills: cvData?.softSkills || [],
    yearsOfExperience: cvData?.yearsOfExperience || 0,
    languages: cvData?.language || [],
    // Preserve certifications from parsed CV
    certifications: cvData?.certifications || [],
    education: (cvData?.education || []).map(e => ({
      institutionName: e?.institutionName || '',
      certification: e?.certification || '',
      durationFrom: e?.durationFrom || '',
      durationTo: e?.durationTo || '',
      summary: e?.summary || '',
    })),
    experience: (cvData?.experience || []).map(e => ({
      institutionName: e?.institutionName || '',
      position: e?.position || '',
      durationFrom: e?.durationFrom || '',
      durationTo: e?.durationTo || '',
      summary: e?.summary || '',
    })),
  };
};

export default {
  extractCertifications,
  calculateExperienceYears,
  buildNormalizedProfile,
  extractApplicantInfoFromParsedCV,
};
