
/**
 * @fileOverview Zod schemas and TypeScript types for user-related data structures.
 */

import { z } from 'zod';

export const CreateUserInputSchema = z.object({
  name: z.string().describe("The new user's full name."),
  email: z.string().email().describe("The new user's email address."),
  role: z.enum(['Admin', 'Creator', 'Member']).describe("The user's role."),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
