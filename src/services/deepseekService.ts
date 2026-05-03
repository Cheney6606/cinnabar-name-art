import { UserContext, NameIdentity } from "../types";
import { buildUnifiedPrompt, parseNameResponse } from "./name-prompt";

const apiKey = (import.meta as any).env?.VITE_DEEPSEEK_API_KEY;
const baseUrl = 'https://api.deepseek.com/v1';

const TIMEOUT_MS = 30000;

export async function generateNames(context: UserContext): Promise<NameIdentity[]> {
  if (!apiKey) {
    console.error("DeepSeek API key not configured");
    throw new Error("API configuration error");
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Request timeout. Please try again.'));
    }, TIMEOUT_MS);
  });

  const prompt = buildUnifiedPrompt(context);

  const requestBody = {
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that generates Chinese names."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 2000,
    temperature: 0.7
  };

  try {
    const responsePromise = fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from API');
    }

    console.log('✅ DeepSeek generated response successfully');
    return parseNameResponse(content, context.intent);

  } catch (error) {
    console.error("DeepSeek API error:", error);
    const errorMsg = (error as Error).message || 'Failed to generate names. Please try again.';
    throw new Error(errorMsg);
  }
}
