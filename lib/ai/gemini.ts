import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateStructuredJson<T>(
  systemPrompt: string,
  userPrompt: string,
  fallbackData: T
): Promise<T> {
  if (!genAI || !apiKey) {
    console.warn("[Gemini API] No GEMINI_API_KEY detected. Using deterministic fallback.");
    return fallbackData;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanJson) as T;
  } catch (error) {
    console.error("[Gemini API Error] Fallback triggered:", error);
    return fallbackData;
  }
}