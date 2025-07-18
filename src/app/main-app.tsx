
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User as FirebaseAuthUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById, type User } from '@/lib/data-service';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';

// Create a context to hold the user data
export const UserContext = React.createContext<User | null>(null);

export function MainApp({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        // User is signed in, get our app-specific user data
        const appUser = await getUserById(firebaseUser.uid);
        setUser(appUser);
      } else {
        // User is signed out
        setUser(null);
        router.push('/login');
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // This case is mostly handled by the redirect, but it's a good fallback
    return null;
  }

  return (
    <UserContext.Provider value={user}>
        <AppLayout>
            {children}
        </AppLayout>
        <Toaster />
    </UserContext.Provider>
  );
}
