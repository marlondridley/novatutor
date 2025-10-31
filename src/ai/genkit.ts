import OpenAI from "openai";
import { logger } from "@/lib/logger";

/**
 * AI Provider Configuration
 * Supports both DeepSeek (default) and Azure OpenAI (via environment variables)
 */
const getAIProvider = () => {
  // Priority: Azure OpenAI > DeepSeek
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (azureKey && azureEndpoint) {
    logger.info("Using Azure OpenAI as AI provider", {
      endpoint: azureEndpoint.replace(/\/$/, ''), // Remove trailing slash
    });
    return {
      client: new OpenAI({
        apiKey: azureKey,
        baseURL: `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4'}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
      }),
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      provider: 'azure' as const,
    };
  }

  if (deepseekKey) {
    logger.info("Using DeepSeek as AI provider");
    return {
      client: new OpenAI({
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        apiKey: deepseekKey,
      }),
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      provider: 'deepseek' as const,
    };
  }

  if (openaiKey) {
    logger.info("Using OpenAI as AI provider");
    return {
      client: new OpenAI({ apiKey: openaiKey }),
      model: process.env.OPENAI_MODEL || 'gpt-4',
      provider: 'openai' as const,
    };
  }

  throw new Error(
    'No AI provider configured. Please set one of: AZURE_OPENAI_API_KEY, DEEPSEEK_API_KEY, or OPENAI_API_KEY'
  );
};

const aiConfig = getAIProvider();

// Initialize OpenAI client (compatible with DeepSeek, Azure OpenAI, or standard OpenAI)
export const openai = aiConfig.client;

// Default model to use
export const DEFAULT_MODEL = aiConfig.model;

// Export provider type for monitoring
export const AI_PROVIDER = aiConfig.provider;
