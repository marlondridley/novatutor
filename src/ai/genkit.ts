import OpenAI from "openai";

// Initialize OpenAI client with DeepSeek API
export const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// Default model to use
export const DEFAULT_MODEL = "deepseek-chat";
