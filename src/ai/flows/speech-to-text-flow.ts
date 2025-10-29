'use server';
/**
 * @fileOverview Converts audio speech to text using OpenAI Whisper API.
 *
 * - speechToText - A function that handles the speech-to-text conversion.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 */

import { z } from 'zod';
import OpenAI from 'openai';
import { retryWithBackoff } from '../error-handling';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording of spoken audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('Language code (e.g., "en", "es", "fr")'),
  prompt: z.string().optional().describe('Optional context to guide transcription'),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio input.'),
  language: z.string().optional().describe('Detected language (if not specified)'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

/**
 * Supported audio formats for Whisper API
 */
const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];

/**
 * Maximum file size (25 MB for Whisper API)
 */
const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Convert data URI to File object
 */
function dataUriToFile(dataUri: string, filename: string = 'audio'): File {
  const arr = dataUri.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'audio/mpeg';
  const bstr = Buffer.from(arr[1], 'base64');
  
  // Determine file extension from MIME type
  const ext = mime.split('/')[1] || 'mp3';
  const fullFilename = `${filename}.${ext}`;
  
  return new File([bstr], fullFilename, { type: mime });
}

/**
 * Speech-to-text conversion using OpenAI Whisper API
 */
export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  const { audioDataUri, language, prompt } = input;

  // Validate data URI format
  if (!audioDataUri.startsWith('data:')) {
    throw new Error('Invalid audio data URI format. Must start with "data:"');
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'OpenAI API key not configured. ' +
      'Please set OPENAI_API_KEY in your .env.local file to use speech-to-text.'
    );
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return retryWithBackoff(async () => {
    // Convert data URI to File
    const audioFile = dataUriToFile(audioDataUri);

    // Validate file size
    if (audioFile.size > MAX_FILE_SIZE) {
      throw new Error(
        `Audio file too large (${(audioFile.size / 1024 / 1024).toFixed(2)}MB). ` +
        `Maximum size is 25MB. Please use a shorter recording or compress the audio.`
      );
    }

    // Validate file format
    const ext = audioFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !SUPPORTED_FORMATS.includes(ext)) {
      throw new Error(
        `Unsupported audio format: ${ext}. ` +
        `Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
      );
    }

    console.log(`🎤 Transcribing audio (${(audioFile.size / 1024).toFixed(2)}KB, ${ext})...`);

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language, // Optional: specify language
      prompt: prompt || 'Educational content transcription for student learning.', // Context hint
      response_format: 'json', // Can also use 'text', 'srt', 'vtt'
    });

    console.log(`✅ Transcription complete (${transcription.text.length} characters)`);

    return {
      transcript: transcription.text,
      language: language || 'auto-detected',
    };
  });
}

/**
 * Batch transcribe multiple audio files
 */
export async function batchSpeechToText(
  inputs: SpeechToTextInput[]
): Promise<SpeechToTextOutput[]> {
  const results = await Promise.all(
    inputs.map(input => speechToText(input))
  );
  
  return results;
}
