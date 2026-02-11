import OpenAI from "openai";
import fs from "fs";

// حدا يشتري ال
//api
// يا فقراء , لانه فش اشي ببلاش في هالدنيا ,
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export const analyzeCVFromFile = async (filePath,jobDescription) => {

  const file = await client.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const prompt = `
Role: Act as a Senior Technical Recruiter and Career Coach with 15+ years of experience. You also have deep technical expertise in Applicant Tracking Systems (ATS) algorithms.

Task: Conduct a brutal, line-by-line analysis of the following CV. Your goal is to maximize the candidate's chances of getting past automated filters and impressing human hiring managers.

Please provide the response in the following structured format:

1. Executive Summary
- Give a high-level assessment of the CV's first impression (e.g., is it modern, dated, cluttered, or professional?).

2. ATS Compliance Audit
- Parsing Risks: Identify any layout elements (columns, tables, graphics, headers/footers) that will break ATS parsing.
- Keyword Gap Analysis: Based on the implied target role, list high-value keywords that are missing or underused.
- Formatting: Critique the font, margins, and file structure for machine readability.

3. Deep Dive: Strengths & Weaknesses
- Strengths: List the top 3-5 elements that are working well (e.g., strong metrics, clear progression, good certifications).
- Weaknesses: List the top 3-5 critical errors (e.g., generic clichés, listing duties instead of achievements, spelling errors, "fluff" content).

4. Section-by-Section Improvement Plan
- Summary/Profile: Critique the narrative. Is it unique or generic? Rewrite the opening sentence to be punchier.
- Experience Section: Analyze the bullet points. Are they quantifiable?
- Action Item: Select one weak bullet point from the CV and rewrite it using the "Action + Context + Result" (Google X-Y-Z) formula to show how it should look.
- Skills & Education: Check for relevance and hierarchy.

5. The Scorecard
- ATS Score (0-100): Based on keyword optimization and formatting.
- Recruiter Impact Score (0-100): Based on persuasiveness, clarity, and "wow" factor.
- Final Weighted Score (0-100): The average of the two.

${jobDescription ? `

6. Job Match Analysis
- Compare this CV against the following job description and evaluate how well the candidate fits.
- Highlight matching skills, missing requirements, and suggestions to tailor the CV for this role.

Job Description:
${jobDescription}` : ""}`;

  const response = await client.responses.create({
    model: "gpt-4",
    input: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "file", file: { file_id: file.id } },
        ],
      },
    ],
  });

  return response.output_text;
};

export default client;

