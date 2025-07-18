
/**
 * @fileoverview This file initializes the Genkit AI system with necessary plugins.
 * It aiconfigures the Genkit instance and exports it for use throughout the application.
 *
 * It is important that this file is imported before any other file that uses Genkit.
 */
import { genkit } from 'genkit';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This allows the application to use Google's AI models like Gemini.
export const ai = genkit({
  plugins: [
    googleAI(),
    enableFirebaseTelemetry({}),
    // Add other plugins here
  ],
  // Where to store flow state.
  flowStateStore: 'firebase', // This works by simply using the string 'firebase'
  // Where to store traces.
  traceStore: 'firebase', // This works by simply using the string 'firebase'
});
