import { UserContext, NameIdentity } from "../types";
import { ModelProvider, detectUserRegion } from "./ip-detector";
import { generateNamesWithGemini } from "./geminiService";

const TIMEOUT_MS = 30000;

async function generateWithDeepSeek(context: UserContext): Promise<NameIdentity[]> {
  const { generateNames } = await import("./deepseekService");
  return generateNames(context);
}

export async function generateNames(context: UserContext): Promise<NameIdentity[]> {
  let primaryProvider: ModelProvider;
  let useFallback = false;

  try {
    primaryProvider = await detectUserRegion();
    console.log(`🎯 Model Dispatcher: Primary provider = ${primaryProvider}`);
  } catch (error) {
    console.error('🎯 Model Dispatcher: Region detection failed, defaulting to Gemini', error);
    primaryProvider = 'gemini';
  }

  if (primaryProvider === 'deepseek') {
    try {
      console.log('🚀 Model Dispatcher: Attempting DeepSeek...');
      const result = await Promise.race([
        generateWithDeepSeek(context),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('DeepSeek timeout')), TIMEOUT_MS)
        )
      ]);
      console.log('✅ Model Dispatcher: DeepSeek succeeded');
      return result;
    } catch (deepseekError) {
      console.warn('⚠️ Model Dispatcher: DeepSeek failed, falling back to Gemini:', deepseekError);
      useFallback = true;
    }
  } else {
    try {
      console.log('🚀 Model Dispatcher: Attempting Gemini...');
      const result = await Promise.race([
        generateNamesWithGemini(context),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini timeout')), TIMEOUT_MS)
        )
      ]);
      console.log('✅ Model Dispatcher: Gemini succeeded');
      return result;
    } catch (geminiError) {
      console.warn('⚠️ Model Dispatcher: Gemini failed, falling back to DeepSeek:', geminiError);
      useFallback = true;
    }
  }

  if (useFallback) {
    const fallbackProvider = primaryProvider === 'deepseek' ? 'gemini' : 'deepseek';
    console.log(`🔄 Model Dispatcher: Attempting fallback to ${fallbackProvider}...`);

    try {
      if (fallbackProvider === 'gemini') {
        const result = await Promise.race([
          generateNamesWithGemini(context),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini fallback timeout')), TIMEOUT_MS)
          )
        ]);
        console.log('✅ Model Dispatcher: Gemini fallback succeeded');
        return result;
      } else {
        const result = await Promise.race([
          generateWithDeepSeek(context),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('DeepSeek fallback timeout')), TIMEOUT_MS)
          )
        ]);
        console.log('✅ Model Dispatcher: DeepSeek fallback succeeded');
        return result;
      }
    } catch (fallbackError) {
      console.error('❌ Model Dispatcher: Both providers failed:', fallbackError);
      throw new Error('Name generation service temporarily unavailable. Please try again later.');
    }
  }

  throw new Error('Name generation failed. Please try again.');
}

export { detectUserRegion } from "./ip-detector";
export { generateNamesWithGemini } from "./geminiService";
export type { ModelProvider } from "./name-prompt";
