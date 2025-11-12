'use client';

import { useState, useEffect, useRef } from 'react';

interface SummarizerOptions {
  maxLength?: number;
  minLength?: number;
}

export function useLocalSummarizer() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pipelineRef = useRef<any>(null);

  // Load model on mount (with lazy loading)
  useEffect(() => {
    async function loadModel() {
      try {
        setIsLoading(true);
        const { pipeline } = await import('@xenova/transformers');
        
        // Use a lightweight summarization model
        // Model: ~45MB, cached after first download
        pipelineRef.current = await pipeline(
          'summarization',
          'Xenova/distilbart-cnn-6-6',
          {
            progress_callback: (data: any) => {
              if (data.status === 'progress') {
                setProgress(Math.round(data.progress));
              }
            }
          }
        );
        
        setIsModelLoaded(true);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to load summarization model:', err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    loadModel();
  }, []);

  const summarize = async (
    text: string,
    options: SummarizerOptions = {}
  ): Promise<string> => {
    if (!pipelineRef.current) {
      throw new Error('Model not loaded yet');
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Text too short to summarize (min 50 characters)');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await pipelineRef.current(text, {
        max_length: options.maxLength || 130,
        min_length: options.minLength || 30,
        do_sample: false,
      });

      setIsLoading(false);
      return result[0].summary_text;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    summarize,
    isLoading,
    isModelLoaded,
    progress,
    error,
  };
}

