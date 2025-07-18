/**
 * @fileoverview This file initializes the Genkit AI system with necessary plugins.
 * It configures the Genkit instance and exports it for use throughout the application.
 *
 * It is important that this file is imported before any other file that uses Genkit.
 */
import { genkit } from 'genkit';
import { firebase } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin.
// This allows the application to use Google's AI models like Gemini.
export const ai = genkit({
  plugins: [
    firebase(), // Recommended to be the first plugin
    googleAI(),
    // Add other plugins here
  ],
  // Log level for debugging.
  // Options (in increasing order of verbosity): 'silent', 'error', 'warn', 'info', 'debug'
  logLevel: 'debug',
  // Where to store flow state.
  flowStateStore: 'firebase',
  // Where to store traces.
  traceStore: 'firebase',
});
