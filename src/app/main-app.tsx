
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/lib/data-service';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';

// Create a context to hold the user data
export const UserContext = React.createContext<User | null>(null);

export function MainApp({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // DEV-MODE: Bypass login and set a default admin user.
    // This is a temporary measure until login is re-enabled.
    const defaultUser: User = {
        id: 'BhlKYjrL0lQU96ze7vaVeYtn6cr1', // Replace with a real UID if needed for testing
        name: 'Admin User',
        email: 'admin@hopehub.com',
        avatar: 'https://placehold.co/100x100.png?text=AU',
        role: 'Admin'
    };
    setUser(defaultUser);
    setIsLoading(false);
    
    // Original auth logic is commented out below to disable login screen.
    /*
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
    */
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // This can happen briefly or if the default user isn't found.
     return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
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
