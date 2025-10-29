'use server';
/**
 * @fileOverview Converts audio speech to text.
 *
 * - speechToText - A function that handles the speech-to-text conversion.
 * - SpeechToTextInput - The input type for the speechToText function.
 * - SpeechToTextOutput - The return type for the speechToText function.
 * 
 * NOTE: This feature requires a speech-to-text service (e.g., OpenAI Whisper API, Google Speech-to-Text).
 * DeepSeek does not currently support audio transcription.
 */

import { z } from 'zod';

const SpeechToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A recording of spoken audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SpeechToTextInput = z.infer<typeof SpeechToTextInputSchema>;

const SpeechToTextOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio input.'),
});
export type SpeechToTextOutput = z.infer<typeof SpeechToTextOutputSchema>;

export async function speechToText(input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  // TODO: Implement speech-to-text using a service like:
  // - OpenAI Whisper API (https://platform.openai.com/docs/guides/speech-to-text)
  // - Google Cloud Speech-to-Text
  // - Azure Speech Services
  
  throw new Error(
    'Speech-to-text is not currently implemented. ' +
    'DeepSeek does not support audio transcription. ' +
    'Please integrate a dedicated speech-to-text service like OpenAI Whisper API.'
  );
}
