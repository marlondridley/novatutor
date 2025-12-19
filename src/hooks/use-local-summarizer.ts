/**
 * Simple Rule-Based Summarizer Hook
 * 
 * Uses extractive summarization (no heavy ML models needed):
 * - Sentence scoring based on keywords, position, and length
 * - No external dependencies or model downloads
 * - Works instantly, 100% private
 * 
 * Usage:
 *   const { summarize, isLoading } = useLocalSummarizer();
 *   const summary = await summarize("Long text here...");
 */

'use client';

import { useState } from 'react';

interface SummarizerOptions {
  maxSentences?: number; // Max sentences in summary (default: 3)
  minLength?: number;    // Min text length to summarize (default: 100)
}

export function useLocalSummarizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Extractive summarization: Score sentences and return top N
   */
  const summarize = async (
    text: string,
    options: SummarizerOptions = {}
  ): Promise<string> => {
    const { maxSentences = 3, minLength = 100 } = options;

    setIsLoading(true);
    setError(null);

    try {
      // Validate input
      if (!text || text.trim().length < minLength) {
        throw new Error(`Text too short to summarize (min ${minLength} characters)`);
      }

      // Clean and split into sentences
      const sentences = text
        .replace(/\s+/g, ' ')
        .trim()
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10); // Remove very short fragments

      if (sentences.length <= maxSentences) {
        // Already short enough
        return sentences.join('. ') + '.';
      }

      // Score each sentence
      const scored = sentences.map((sentence, index) => {
        let score = 0;

        // Position scoring: First and last sentences often contain key info
        if (index === 0) score += 2; // Opening sentence bonus
        if (index === sentences.length - 1) score += 1.5; // Closing sentence bonus

        // Length scoring: Prefer medium-length sentences
        const words = sentence.split(' ').length;
        if (words >= 8 && words <= 25) score += 1;

        // Keyword scoring: Look for important words
        const keywords = [
          'important', 'key', 'main', 'essential', 'crucial', 'significant',
          'therefore', 'because', 'result', 'conclusion', 'summary',
          'first', 'second', 'third', 'finally', 'overall',
        ];
        const lowerSentence = sentence.toLowerCase();
        keywords.forEach(keyword => {
          if (lowerSentence.includes(keyword)) score += 0.5;
        });

        // Numbers and specific terms often indicate important facts
        if (/\d+/.test(sentence)) score += 0.3;
        if (/[A-Z][a-z]+\s[A-Z][a-z]+/.test(sentence)) score += 0.2; // Proper nouns

        return { sentence, score, index };
      });

      // Sort by score and take top N
      const topSentences = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSentences)
        .sort((a, b) => a.index - b.index); // Re-sort by original order

      const summary = topSentences.map(s => s.sentence).join('. ') + '.';

      setIsLoading(false);
      return summary;

    } catch (err: any) {
      console.error('Summarization error:', err);
      setError(err.message || 'Failed to summarize');
      setIsLoading(false);
      throw err;
    }
  };

  return {
    summarize,
    isLoading,
    isModelLoaded: true, // No model needed
    progress: 100,       // Always ready
    error,
  };
}
