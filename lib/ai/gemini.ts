import { GoogleGenerativeAI } from "@google/generative-ai";
import { logAiMetrics } from "./guardrails";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const TIMEOUT_MS = 8000;
const MAX_RETRIES = 1;

export async function generateStructuredJson<T>(
  systemPrompt: string,
  userPrompt: string,
  fallbackData: T
): Promise<T> {
  const startTime = Date.now();

  if (!genAI || !apiKey) {
    logAiMetrics({
      endpoint: "/api/ai/dm",
      model: "fallback-deterministic",
      latencyMs: Date.now() - startTime,
      promptChars: userPrompt.length,
      responseChars: JSON.stringify(fallbackData).length,
      status: "fallback",
      errorReason: "NO_GEMINI_API_KEY",
      timestamp: new Date().toISOString(),
    });
    return fallbackData;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
    systemInstruction: systemPrompt,
  });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const attemptStartTime = Date.now();
    try {
      // Timeout promise wrapper
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini request timed out after ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
      );

      const generatePromise = model.generateContent(userPrompt);
      const result = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = result.response.text();

      const cleanJson = responseText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanJson) as T;

      logAiMetrics({
        endpoint: "/api/ai/dm",
        model: "gemini-2.0-flash",
        latencyMs: Date.now() - startTime,
        promptChars: userPrompt.length,
        responseChars: responseText.length,
        status: "success",
        timestamp: new Date().toISOString(),
      });

      return parsed;
    } catch (error: any) {
      const isLastAttempt = attempt === MAX_RETRIES;
      console.warn(`[Gemini API Attempt ${attempt + 1}/${MAX_RETRIES + 1} Failed]:`, error?.message || error);

      if (!isLastAttempt) {
        // Jittered backoff: wait 500ms + random 200ms
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 200));
      } else {
        logAiMetrics({
          endpoint: "/api/ai/dm",
          model: "gemini-2.0-flash",
          latencyMs: Date.now() - startTime,
          promptChars: userPrompt.length,
          responseChars: JSON.stringify(fallbackData).length,
          status: "fallback",
          errorReason: error?.message || "UNKNOWN_ERROR",
          timestamp: new Date().toISOString(),
        });
        return fallbackData;
      }
    }
  }

  return fallbackData;
}