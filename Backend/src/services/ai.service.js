const {GoogleGenAI} = require("@google/genai")
const {z} = require("zod")
const {zodToJsonSchema} = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// async function invokeGeminiAi() {

//     const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: "Hello gemini ! Explain what is Interview ?"
//     })
//     console.log(response.text)
// }
const interViewReportSchema = z.object({
    matchScore: z.number(). describe("A score between 0 to 100 indicating how well the candidate's profile matches the job describe"),
   
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what point to cover, what approach to take etc.")
    })).describe("Technical question that can be asked in the interview along with their intention and how to answer them"),
    
    behavioralQuestions:  z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what point to cover, what approach to take etc.")
    })).describe("Technical question that can be asked in the interview along with their intention and how to answer them"),
    
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job application")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
   
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan , starting from 1"),
       focus: z.string().describe("main focus of this day in the preparation plan e.g. data structure , system design, mock interviews effectively"),
       tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the prparation")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview ")
 ,
    title: z.string().describe("The title of the job for which the interview report is generated.")
})

function normalizeKeyValueArray(arr, startKey) {
    if (!Array.isArray(arr) || arr.length === 0) return arr;
    if (arr.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))) return arr;

    const result = [];
    let current = {};

    for (let i = 0; i < arr.length; i += 2) {
        const key = arr[i];
        const value = arr[i + 1];
        if (typeof key !== 'string') {
            return arr;
        }
        if (key === startKey && Object.keys(current).length > 0) {
            result.push(current);
            current = {};
        }
        current[key] = value;
    }

    if (Object.keys(current).length > 0) {
        result.push(current);
    }

    return result.length > 0 ? result : arr;
}

function normalizeInterviewReport(report) {
    if (!report || typeof report !== 'object') return report;

    const normalized = { ...report };

    if (typeof normalized.matchScore === 'number' && normalized.matchScore <= 1) {
        normalized.matchScore = Math.round(normalized.matchScore * 100);
    }

    normalized.technicalQuestions = normalizeKeyValueArray(normalized.technicalQuestions, 'question');
    normalized.behavioralQuestions = normalizeKeyValueArray(normalized.behavioralQuestions, 'question');
    normalized.skillGaps = normalizeKeyValueArray(normalized.skillGaps, 'skill');
    normalized.preparationPlan = normalizeKeyValueArray(normalized.preparationPlan, 'day');

    if (Array.isArray(normalized.preparationPlan)) {
        normalized.preparationPlan = normalized.preparationPlan.map((item) => {
            if (item && typeof item === 'object' && item.tasks && !Array.isArray(item.tasks)) {
                return { ...item, tasks: [item.tasks] };
            }
            return item;
        });
    }

   return normalized;
}

async function generateInterviewReport({resume, selfDescription, jobDescription}) {
    const title = jobDescription?.split(/[\n\.]/)?.[0]?.trim() || "Interview Report";
    const prompt = `Generate an interview report for a candidate with the following details:\n\nResume: ${resume}\n\nSelf Description: ${selfDescription}\n\nJob Description: ${jobDescription}\n\nRespond with valid JSON only. The JSON object must have these exact keys:\n- title (string)\n- matchScore (number from 0 to 100)\n- technicalQuestions (array of objects, each with question, intention, and answer)\n- behavioralQuestions (array of objects, each with question, intention, and answer)\n- skillGaps (array of objects, each with skill and severity; severity must be low, medium, or high)\n- preparationPlan (array of objects, each with day, focus, and tasks array)\n\nExample output format:\n{
  "title": "Senior Frontend Engineer",
  "matchScore": 86,
  "technicalQuestions": [{"question":"...","intention":"...","answer":"..."}],
  "behavioralQuestions": [{"question":"...","intention":"...","answer":"..."}],
  "skillGaps": [{"skill":"...","severity":"medium"}],
  "preparationPlan": [{"day":1,"focus":"...","tasks":["...","..."]}]
}\n\nUse short, clear question and answer text. Do not include any markdown, explanation, or additional keys. Use the provided resume, self description, and job description to make the report specific and actionable.\n`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            temperature: 0,
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(interViewReportSchema)
        }
    });

    const text = response.text?.trim();
    if (!text) {
        throw new Error("AI did not return any text response");
    }

    let report;
    try {
        report = JSON.parse(text);
    } catch (error) {
        throw new Error(`Failed to parse AI response as JSON: ${error.message}. Response text: ${text}`);
    }

    const normalizedReport = normalizeInterviewReport({
        ...report,
        title: report.title || title,
    });

    return normalizedReport;
}

module.exports = generateInterviewReport