// src/ai/flows/community-summary.ts
'use server';
/**
 * @fileOverview A community summary AI agent.
 *
 * - generateCommunitySummary - A function that generates a summary of popular discussion themes and member engagement.
 * - CommunitySummaryInput - The input type for the generateCommunitySummary function.
 * - CommunitySummaryOutput - The return type for the generateCommunitySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CommunitySummaryInputSchema = z.object({
  discussionThemes: z
    .string()
    .describe('A summary of recent discussion themes within the community.'),
  memberEngagementData: z
    .string()
    .describe('Data on member engagement, such as participation rates and feedback.'),
});
export type CommunitySummaryInput = z.infer<typeof CommunitySummaryInputSchema>;

const CommunitySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of popular discussion themes and member engagement.'),
  insights: z.string().describe('Insights on how to tailor events and communication to better meet the communitys needs.'),
  recommendations: z
    .string()
    .describe('Recommendations for improving overall participation and satisfaction.'),
});
export type CommunitySummaryOutput = z.infer<typeof CommunitySummaryOutputSchema>;

export async function generateCommunitySummary(input: CommunitySummaryInput): Promise<CommunitySummaryOutput> {
  return communitySummaryFlow(input);
}

const communitySummaryPrompt = ai.definePrompt({
  name: 'communitySummaryPrompt',
  input: {schema: CommunitySummaryInputSchema},
  output: {schema: CommunitySummaryOutputSchema},
  prompt: `You are an AI assistant helping a charity group admin understand the community's needs.

  Summarize the popular discussion themes and member engagement data provided, and provide insights and recommendations on how to tailor events and communication to better meet the community's needs, improving overall participation and satisfaction.

  Discussion Themes: {{{discussionThemes}}}
  Member Engagement Data: {{{memberEngagementData}}}

  Summary:
  {{summary}}

  Insights:
  {{insights}}

  Recommendations:
  {{recommendations}}`,
});

const communitySummaryFlow = ai.defineFlow(
  {
    name: 'communitySummaryFlow',
    inputSchema: CommunitySummaryInputSchema,
    outputSchema: CommunitySummaryOutputSchema,
  },
  async input => {
    const {output} = await communitySummaryPrompt(input);
    return output!;
  }
);
