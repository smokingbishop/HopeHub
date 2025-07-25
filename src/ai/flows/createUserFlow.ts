
'use server';
/**
 * @fileOverview A flow for securely creating a new user in Firebase Authentication and Firestore.
 *
 * - createUser - Creates a user in Firebase Auth and a corresponding user document in Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { type User } from '@/lib/data-service';
import { CreateUserInputSchema, type CreateUserInput } from '@/ai/schemas/user-schemas';


const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
  role: z.enum(['Admin', 'Creator', 'Member']),
});


export async function createUser(input: CreateUserInput): Promise<User> {
  return createUserFlow(input);
}

const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: UserSchema,
  },
  async (input) => {
    try {
      // Access Firebase services inside the flow to ensure initialization.
      const auth = admin.auth();
      const db = admin.firestore();

      // 1. Create user in Firebase Authentication
      const userRecord = await auth.createUser({
        email: input.email,
        displayName: input.name,
        // You might want to generate a temporary password or send a password reset email
        // For simplicity, we'll let the user set their password via a link
        // that Firebase can send. For that to work, you need to enable the 
        // "Password Reset" email template in the Firebase Console -> Authentication -> Templates.
      });

      // 2. Create user document in Firestore, using the Auth UID as the document ID
      const userDocRef = db.collection('users').doc(userRecord.uid);

      const newUser: User = {
        id: userRecord.uid,
        name: input.name,
        email: input.email,
        role: input.role,
        avatar: `https://placehold.co/100x100.png?text=${input.name
          .split(' ')
          .map((n) => n[0])
          .join('')}`,
      };

      await userDocRef.set(newUser);
      
      console.log(`Successfully created new user: ${userRecord.uid}`);
      return newUser;

    } catch (error: any) {
        console.error('Error in createUserFlow:', error);
        // Throw a specific error message that can be caught by the client
        throw new Error(`Failed to create user: ${error.message}`);
    }
  }
);
