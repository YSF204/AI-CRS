import OpenAI from "openai";


// حدا يشتري ال 
//api 
// يا فقراء , لانه فش اشي ببلاش في هالدنيا ,
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const askAI = async (prompt) => {
    const response = await client.responses.create({
        model: "gpt-4",
        input: prompt
    });
    return response.output_text;
};

// this is all DEMO things !!!! , we will change them , زي الله واحد , بس المهم الفكرة
export const analyzeCV = async (cvText) => {
    const prompt = `Analyze this CV and extract: skills, experience, education. Return as JSON.\n\nCV:\n${cvText}`;
    return await askAI(prompt);
};

export const matchCVToJob = async (cvData, jobData) => {
    const prompt = `Compare this CV to the job requirements and give a match score (0-100) with reasons.\n\nCV: ${JSON.stringify(cvData)}\n\nJob: ${JSON.stringify(jobData)}`;
    return await askAI(prompt);
};

export const calculateATSScore = async (cvText, jobDescription) => {
    const prompt = `Calculate ATS score for this CV against the job description. Return score (0-100), strengths, weaknesses, and suggestions as JSON.\n\nCV: ${cvText}\n\nJob: ${jobDescription}`;
    return await askAI(prompt);
};

export default client;
