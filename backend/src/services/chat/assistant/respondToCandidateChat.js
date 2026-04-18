import CV from "../../../models/CV.js";
import Job from "../../../models/Job.js";
import OpenAI from "openai";

const getClient = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const cvToText = (cv) =>
    [
        `Job Title: ${cv.jobTitle || "N/A"}`,
        `Summary: ${cv.summary || "N/A"}`,
        `Technical Skills: ${cv.technicalSkills?.join(", ") || "None"}`,
        `Soft Skills: ${cv.softSkills?.join(", ") || "None"}`,
        `Languages: ${cv.language?.join(", ") || "None"}`,
        `Experience: ${cv.experience?.map((entry) => `${entry.position} at ${entry.institutionName}`).join(" | ") || "None"}`,
        `Education: ${cv.education?.map((entry) => `${entry.certification} at ${entry.institutionName}`).join(" | ") || "None"}`,
    ].join("\n");

const jobToText = (job) =>
    [
        `Position: ${job.position}`,
        `Description: ${job.description}`,
        `Technical Skills Required: ${job.technicalSkills?.join(", ") || "None"}`,
        `Soft Skills Required: ${job.softSkills?.join(", ") || "None"}`,
        `Languages Required: ${job.language?.join(", ") || "None"}`,
        `Years of Experience: ${job.yearsOfExperience}`,
        `Work Site: ${job.workSite}`,
    ].join("\n");

const getPageContext = (pathname) => {
    if (!pathname) return null;
    if (pathname.includes("/employee/cv-editor/")) {
        return {
            name: "CV Editor",
            nameAr: "محرر الـ CV",
            description:
                "The user is currently editing their CV. Help them improve specific sections, suggest better wording, or analyze what they have so far.",
        };
    }
    if (pathname.includes("/employee/cv-templates")) {
        return {
            name: "CV Templates",
            nameAr: "قوالب الـ CV",
            description:
                "The user is browsing CV templates. Help them choose the right template for their field and explain the differences.",
        };
    }
    if (pathname.includes("/employee/cvs")) {
        return {
            name: "My CVs",
            nameAr: "سيرتي الذاتية",
            description:
                "The user is viewing their list of CVs. Help them manage, compare, or decide which CV to use for specific jobs.",
        };
    }
    if (pathname.includes("/employee/find-job-by-cv")) {
        return {
            name: "Find Job by CV",
            nameAr: "بحث عن وظيفة بالـ CV",
            description:
                "The user is looking for jobs that match their CV. Help them understand match scores and which jobs suit them best.",
        };
    }
    if (pathname.includes("/employee/apply-job/")) {
        return {
            name: "Apply for Job",
            nameAr: "التقديم على وظيفة",
            description:
                "The user is applying for a job. Help them choose the best CV for this application or fill in the manual form.",
        };
    }
    if (pathname.includes("/employee/jobs")) {
        return {
            name: "Browse Jobs",
            nameAr: "تصفح الوظائف",
            description:
                "The user is browsing available job listings. Help them filter, understand job requirements, or decide which to apply for.",
        };
    }
    if (pathname.includes("/employee/applications")) {
        return {
            name: "My Applications",
            nameAr: "طلباتي",
            description:
                "The user is viewing their job applications. Help them understand application statuses or what to do next.",
        };
    }
    if (pathname.includes("/employee/profile")) {
        return {
            name: "Profile",
            nameAr: "الملف الشخصي",
            description:
                "The user is on their profile page. Help them complete or improve their profile information.",
        };
    }
    if (pathname === "/employee" || pathname === "/employee/") {
        return {
            name: "Dashboard",
            nameAr: "لوحة التحكم",
            description:
                "The user is on the main employee dashboard. Give them an overview of what they can do or guide them to the right section.",
        };
    }

    return null;
};

export const respondToCandidateChat = async ({ userId, messages, cvId, pathname }) => {
    let cvContext = "";
    if (cvId) {
        const cv = await CV.findById(cvId);
        if (cv && cv.userId.toString() === userId.toString()) {
            cvContext = `\n\nCANDIDATE CV:\n${cvToText(cv)}`;
        }
    } else {
        const latestCV = await CV.findOne({ userId }).sort({ createdAt: -1 });
        if (latestCV) {
            cvContext = `\n\nCANDIDATE CV (most recent):\n${cvToText(latestCV)}`;
        }
    }

    const openJobs = await Job.find({ status: "OPEN" }).limit(50);
    const jobsContext =
        openJobs.length > 0
            ? `\n\nAVAILABLE OPEN JOBS:\n${openJobs
                .map((job, index) => `--- Job ${index + 1} ---\nID: ${job._id}\n${jobToText(job)}`)
                .join("\n\n")}`
            : "\n\nNo open jobs available currently.";

    const pageInfo = getPageContext(pathname);
    const pageContext = pageInfo
        ? `\n\nCURRENT PAGE: ${pageInfo.name} (${pageInfo.nameAr})\nCONTEXT: ${pageInfo.description}`
        : "";

    const systemPrompt = `You are an expert Career Coach and CV specialist built into the AI-CRS recruitment platform.

YOUR CAPABILITIES:
1. Analyze and improve the candidate's CV
2. Suggest specific, actionable edits to make the CV stronger
3. Know all open job listings on the platform and recommend suitable ones
4. When the user asks about a specific job or wants to tailor their CV for a job, compare their CV against that job's requirements and give precise improvement suggestions
5. Know which page the user is currently on and give context-aware help

BEHAVIOR RULES:
- CRITICAL: Always detect the language of the user's message and respond in the EXACT same language. If they write in Arabic, respond in Arabic. If they write in English, respond in English. If they switch languages, switch with them immediately.
- Be specific and actionable; do not give generic advice
- When the user asks "what can I do here?" or similar, explain the current page and its features
- When recommending jobs, reference actual job titles from the available jobs list
- Keep responses concise (4-6 sentences or bullet points) unless asked for more
- Never make up job listings; only reference jobs from the AVAILABLE OPEN JOBS list
${pageContext}
${cvContext}
${jobsContext}`;

    const response = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((message) => ({ role: message.role, content: message.content })),
        ],
        max_tokens: 600,
        temperature: 0.7,
    });

    return response.choices[0].message.content;
};

export default respondToCandidateChat;
