import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateNotes(topic: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(`
Create COMPLETE EXAM-ORIENTED STUDY NOTES on:

${topic}

Return ONLY notes in markdown format.
`);

    const notes = result.response.text();

    return {
      notes,
      diagramPrompt: topic,
    };
  } catch (error) {
    console.error("Notes Generation Error:", error);

    return {
      notes: `
# Error

Unable to generate notes.

Possible reasons:
- Gemini API quota exhausted
- Invalid API key
- Internet issue
`,
      diagramPrompt: topic,
    };
  }
}