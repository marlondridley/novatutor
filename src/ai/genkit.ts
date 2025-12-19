/**
 * AI Provider Configuration
 * 
 * This file sets up the OpenAI client. It supports multiple providers:
 * - Azure OpenAI (enterprise)
 * - DeepSeek (cheap, $0.14/million tokens)
 * - OpenAI (standard)
 * 
 * The client is OpenAI-compatible, so the same code works with all providers.
 * 
 * Setup (.env.local):
 *   # Option 1: DeepSeek (recommended for cost savings)
 *   DEEPSEEK_API_KEY=sk-xxx
 * 
 *   # Option 2: OpenAI
 *   OPENAI_API_KEY=sk-xxx
 * 
 *   # Option 3: Azure OpenAI (enterprise)
 *   AZURE_OPENAI_API_KEY=xxx
 *   AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
 *   AZURE_OPENAI_DEPLOYMENT=gpt-4
 */

import OpenAI from "openai";

// =============================================================================
// PROVIDER DETECTION
// =============================================================================

type Provider = 'azure' | 'deepseek' | 'openai';

interface AIConfig {
  client: OpenAI;
  model: string;
  provider: Provider;
}

/**
 * Detect and configure the AI provider based on environment variables.
 * Priority: Azure > DeepSeek > OpenAI
 */
function getAIProvider(): AIConfig {
  // Azure OpenAI (enterprise)
  if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, '');
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    
    return {
      client: new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${endpoint}/openai/deployments/${deployment}`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
      }),
      model: deployment,
      provider: 'azure',
    };
  }

  // DeepSeek (cheapest option - $0.14/million tokens vs OpenAI's $30/million)
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      client: new OpenAI({
        baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
      }),
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      provider: 'deepseek',
    };
  }

  // Standard OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: process.env.OPENAI_MODEL || 'gpt-4',
      provider: 'openai',
    };
  }

  throw new Error(
    'No AI provider configured. Set one of: DEEPSEEK_API_KEY, OPENAI_API_KEY, or AZURE_OPENAI_API_KEY'
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

const config = getAIProvider();

/** OpenAI-compatible client (works with DeepSeek, Azure, or OpenAI) */
export const openai = config.client;

/** Default model to use for AI calls */
export const DEFAULT_MODEL = config.model;

/** Which provider is being used (for logging/debugging) */
export const AI_PROVIDER = config.provider;
