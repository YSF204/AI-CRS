import OpenAI from "openai";
import fs from "fs";

let client;
const getClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

const buildPrompt = (jobDescription) => `You are a Senior Technical Recruiter and ATS expert.

Do TWO things with the attached CV:

1. EXTRACT the CV data into structured fields
2. ANALYZE the CV and score it

${jobDescription ? `Target job: "${jobDescription}"` : ""}

Respond with ONLY a valid JSON object (no markdown, no code fences).

{
  "cvData": {
    "jobTitle": "<extracted job title or target role>",
    "summary": "<extracted profile summary>",
    "contact": {
      "email": "<email or null>",
      "phone": "<phone or null>",
      "linkedin": "<linkedin url or null>",
      "github": "<github url or null>"
    },
    "address": {
      "city": "<city or N/A>",
      "street": "<street or N/A>"
    },
    "experience": [
      { "institutionName": "<company>", "position": "<role>", "duration": <years as number>, "summary": "<brief description>" }
    ],
    "education": [
      { "institutionName": "<school>", "certification": "<degree>", "duration": <years as number>, "summary": "<brief description>" }
    ],
    "technicalSkills": ["<skill1>", "<skill2>"],
    "softSkills": ["<skill1>", "<skill2>"],
    "language": ["<lang1>", "<lang2>"]
  },
  "analysis": {
    "score": <number 0-100>,
    "strengths": "<3-5 short bullet points>",
    "weaknesses": "<3-5 short bullet points>",
    "suggestions": "<3-5 short bullet points>"
  }
}`;

// for uploaded PDF files — extracts CV data + analyzes in one call
export const analyzeCVFromFile = async (filePath, jobDescription) => {
  const file = await getClient().files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const response = await getClient().responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: buildPrompt(jobDescription) },
          { type: "input_file", file_id: file.id },
        ],
      },
    ],
  });

  return response.output_text;
};



const promptForCvInDatabase = (jobDescription) =>  `You are a Senior Technical Recruiter and ATS expert.

Do ONE thing with the attached CV:

1. ANALYZE the CV and score it

${jobDescription ? `Target job: "${jobDescription}"` : ""}

Respond with ONLY a valid JSON object (no markdown, no code fences).

{
  "analysis": {
    "score": <number 0-100>,
    "strengths": "<3-5 short bullet points>",
    "weaknesses": "<3-5 short bullet points>",
    "suggestions": "<3-5 short bullet points>"
  }
}`;


// for CV in the database 
export const analyzeCVFromDatabase = async (cvText, jobDescription) => {
  const response = await getClient().responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: promptForCvInDatabase(jobDescription) },
          { type: "input_text", text: cvText },
        ],
      },
    ],
  });

  return response.output_text;
};