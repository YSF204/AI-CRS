import fs from "fs";
import CV from "../../../models/CV.js";
import CVAnalysis from "../../../models/CVAnalysis.js";
import { analyzeCVFromFile } from "../../../integrations/ai/openai.js";
import { extractCertifications } from "../../../utils/profileNormalizer.js";
import AppError from "../../../utils/appError.js";
import parseAiJsonResponse from "../helpers/parseAiJsonResponse.js";

const toBulletText = (value) => (Array.isArray(value) ? value.join("\n• ") : value || "N/A");

export const analyzeUploadedCvFile = async ({ filePath, userId, jobDescription }) => {
    const aiResult = await analyzeCVFromFile(filePath, jobDescription);

    let parsed;
    try {
        parsed = parseAiJsonResponse(aiResult);
    } catch (_error) {
        fs.unlinkSync(filePath);
        throw new AppError("AI returned an invalid response, please try again", 500);
    }

    const cvData = parsed.cvData || {};
    const scrubbedExperience = (cvData.experience || []).filter(
        (entry) => entry.institutionName?.trim() && entry.position?.trim(),
    );
    const scrubbedEducation = (cvData.education || []).filter(
        (entry) => entry.institutionName?.trim() && entry.certification?.trim(),
    );

    const allCertifications = extractCertifications(
        { certifications: cvData.certifications || [] },
        cvData.education || [],
        [],
    );

    const customSections = [];
    if (allCertifications.length > 0) {
        customSections.push({
            title: "Certifications",
            sectionType: "certifications",
            items: allCertifications.map((certification) => ({
                name: certification,
                description: "",
                durationFrom: "",
                durationTo: "",
                link: "",
            })),
        });
    }

    const [cv, analysisData] = await Promise.all([
        CV.create({
            userId,
            jobTitle: cvData.jobTitle || "Uploaded CV",
            summary: cvData.summary || "Extracted from uploaded PDF",
            contact: cvData.contact || {},
            address: cvData.address || { city: "N/A", street: "N/A" },
            experience: scrubbedExperience,
            education: scrubbedEducation,
            technicalSkills: cvData.technicalSkills || [],
            softSkills: cvData.softSkills || [],
            language: cvData.language || [],
            customSections,
            layout: {
                sectionOrder: cvData.layout?.sectionOrder || [],
                visibleSections: cvData.layout?.visibleSections || {},
            },
        }),
        Promise.resolve(parsed.analysis || {}),
    ]);

    const analysis = await CVAnalysis.create({
        userId,
        CVId: cv._id,
        atsScore: analysisData.score || 0,
        strength: toBulletText(analysisData.strengths),
        weakness: toBulletText(analysisData.weaknesses),
        suggestion: toBulletText(analysisData.suggestions),
    });

    fs.unlinkSync(filePath);

    return { cv, analysis };
};

export default analyzeUploadedCvFile;
