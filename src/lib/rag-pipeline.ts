/**
 * @fileOverview Azure AI Search RAG (Retrieval-Augmented Generation) Pipeline
 * 
 * This module provides the infrastructure for RAG-powered learning paths and tutoring.
 * When Azure credentials are configured, it retrieves relevant educational content
 * from Azure Cognitive Search to enhance AI responses.
 * 
 * SETUP REQUIRED:
 * 1. Create Azure Cognitive Search service
 * 2. Create search index with educational content
 * 3. Configure embeddings (Azure OpenAI or OpenAI)
 * 4. Set environment variables:
 *    - AZURE_SEARCH_ENDPOINT
 *    - AZURE_SEARCH_KEY
 *    - AZURE_SEARCH_INDEX_NAME
 */

import { logger } from "@/lib/logger";

interface RAGSearchResult {
  content: string;
  source: string;
  score: number;
  metadata?: Record<string, any>;
}

interface RAGOptions {
  subject?: string;
  topic?: string;
  grade?: string;
  limit?: number;
}

/**
 * Search Azure Cognitive Search for relevant educational content
 * Returns empty array if Azure is not configured (graceful degradation)
 */
export async function searchEducationalContent(
  query: string,
  options: RAGOptions = {}
): Promise<RAGSearchResult[]> {
  const endpoint = process.env.AZURE_SEARCH_ENDPOINT;
  const apiKey = process.env.AZURE_SEARCH_KEY;
  const indexName = process.env.AZURE_SEARCH_INDEX_NAME || 'educational-content';

  // Graceful degradation: return empty if Azure not configured
  if (!endpoint || !apiKey) {
    logger.debug('Azure AI Search not configured, skipping RAG retrieval', {
      query,
      hasEndpoint: !!endpoint,
      hasApiKey: !!apiKey,
    });
    return [];
  }

  try {
    const searchUrl = `${endpoint}/indexes/${indexName}/docs/search?api-version=2023-11-01`;
    
    // Build search query with filters
    const searchBody: any = {
      search: query,
      top: options.limit || 5,
      queryType: 'semantic',
      semanticConfiguration: 'default',
      select: 'content, source, metadata',
    };

    // Add filters if provided
    if (options.subject) {
      searchBody.filter = `subject eq '${options.subject}'`;
    }
    if (options.grade) {
      const gradeFilter = `grade eq '${options.grade}'`;
      searchBody.filter = searchBody.filter 
        ? `${searchBody.filter} and ${gradeFilter}`
        : gradeFilter;
    }

    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      throw new Error(`Azure Search API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const results: RAGSearchResult[] = (data.value || []).map((item: any) => ({
      content: item.content || '',
      source: item.source || 'unknown',
      score: item['@search.score'] || 0,
      metadata: item.metadata || {},
    }));

    logger.info('RAG search completed', {
      query,
      resultsCount: results.length,
      subject: options.subject,
    });

    return results;
  } catch (error) {
    logger.error('RAG search error', error instanceof Error ? error : new Error(String(error)), {
      query,
      subject: options.subject,
    });
    // Graceful degradation: return empty array on error
    return [];
  }
}

/**
 * Get embeddings for a text query (for vector search)
 * Uses Azure OpenAI embeddings if configured, otherwise returns null
 */
export async function getEmbeddings(text: string): Promise<number[] | null> {
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Try Azure OpenAI first
  if (azureKey && azureEndpoint) {
    try {
      const embeddingUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${process.env.AZURE_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002'}/embeddings?api-version=2024-02-15-preview`;
      
      const response = await fetch(embeddingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureKey,
        },
        body: JSON.stringify({
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Azure Embeddings API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0]?.embedding || null;
    } catch (error) {
      logger.error('Azure embeddings error', error instanceof Error ? error : new Error(String(error)));
      // Fall through to OpenAI
    }
  }

  // Fallback to OpenAI embeddings
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI Embeddings API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0]?.embedding || null;
    } catch (error) {
      logger.error('OpenAI embeddings error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  logger.debug('No embeddings provider configured');
  return null;
}

/**
 * Format RAG results into context for AI prompts
 */
export function formatRAGContext(results: RAGSearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  const context = results.map((result, index) => {
    return `[Source ${index + 1}: ${result.source}]\n${result.content}`;
  }).join('\n\n');

  return `\n\nRelevant educational content:\n${context}\n`;
}

/**
 * Check if RAG pipeline is configured and available
 */
export function isRAGConfigured(): boolean {
  return !!(
    process.env.AZURE_SEARCH_ENDPOINT &&
    process.env.AZURE_SEARCH_KEY &&
    process.env.AZURE_SEARCH_INDEX_NAME
  );
}

