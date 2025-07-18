
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/lib/data-service';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { mockUsers } from '@/lib/mock-data';

// Create a context to hold the user data
export const UserContext = React.createContext<User | null>(null);

export function MainApp({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // DEV-MODE: Bypass login and set a default admin user.
    // The first user in mockUsers is the admin.
    const defaultUser = mockUsers.find(u => u.role === 'Admin');
    if (defaultUser) {
        setUser(defaultUser);
    }
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
