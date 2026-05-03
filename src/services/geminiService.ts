import { UserContext, NameIdentity } from "../types";
import { buildUnifiedPrompt, parseNameResponse } from "./name-prompt";

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const TIMEOUT_MS = 30000;

export async function generateNamesWithGemini(context: UserContext): Promise<NameIdentity[]> {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not configured");
    throw new Error("API configuration error");
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Gemini request timeout. Please try again.'));
    }, TIMEOUT_MS);
  });

  const prompt = buildUnifiedPrompt(context);

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
    }
  };

  try {
    const responsePromise = fetch(
      `${GEMINI_BASE_URL}/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as Response;

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `Gemini HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('Empty response from Gemini API');
    }

    console.log('✅ Gemini generated response successfully');
    return parseNameResponse(content, context.intent);

  } catch (error) {
    console.error("Gemini API error:", error);
    const errorMsg = (error as Error).message || 'Gemini failed to generate names.';
    throw new Error(errorMsg);
  }
}
