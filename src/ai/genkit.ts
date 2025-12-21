/**
 * AI Provider Configuration
 * 
 * This file sets up the AI client. It supports multiple providers:
 * - Anthropic Claude (recommended - best for education)
 * - Azure OpenAI (enterprise)
 * - DeepSeek (cheap, $0.14/million tokens)
 * - OpenAI (standard)
 * 
 * Setup (.env.local):
 *   # Option 1: Anthropic Claude (RECOMMENDED)
 *   ANTHROPIC_API_KEY=sk-ant-xxx
 * 
 *   # Option 2: DeepSeek (cost savings)
 *   DEEPSEEK_API_KEY=sk-xxx
 * 
 *   # Option 3: OpenAI
 *   OPENAI_API_KEY=sk-xxx
 * 
 *   # Option 4: Azure OpenAI (enterprise)
 *   AZURE_OPENAI_API_KEY=xxx
 *   AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
 *   AZURE_OPENAI_DEPLOYMENT=gpt-4
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// =============================================================================
// PROVIDER DETECTION
// =============================================================================

type Provider = 'anthropic' | 'azure' | 'deepseek' | 'openai';

interface AIConfig {
  client: OpenAI | null;
  anthropicClient: Anthropic | null;
  model: string;
  provider: Provider;
}

/**
 * Detect and configure the AI provider based on environment variables.
 * Priority: Anthropic > Azure > DeepSeek > OpenAI
 */
function getAIProvider(): AIConfig {
  // Anthropic Claude (RECOMMENDED for education)
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      client: null,
      anthropicClient: new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      }),
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      provider: 'anthropic',
    };
  }

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
      anthropicClient: null,
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
      anthropicClient: null,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      provider: 'deepseek',
    };
  }

  // Standard OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      anthropicClient: null,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      provider: 'openai',
    };
  }

  throw new Error(
    'No AI provider configured. Set one of: ANTHROPIC_API_KEY, DEEPSEEK_API_KEY, OPENAI_API_KEY, or AZURE_OPENAI_API_KEY'
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

const config = getAIProvider();

/** OpenAI-compatible client (works with DeepSeek, Azure, or OpenAI) */
export const openai = config.client;

/** Anthropic client for Claude models */
export const anthropic = config.anthropicClient;

/** Default model to use for AI calls */
export const DEFAULT_MODEL = config.model;

/** Which provider is being used (for logging/debugging) */
export const AI_PROVIDER = config.provider;

/** Check if we're using Anthropic */
export const IS_ANTHROPIC = config.provider === 'anthropic';
