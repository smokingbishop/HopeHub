
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { HopeHubLogo } from '@/components/icons';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';


function GoogleIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.6-4.8 1.6-4.54 0-8.28-3.74-8.28-8.28s3.74-8.28 8.28-8.28c2.48 0 4.38.94 5.7 2.25l2.43-2.38C19.4 1.82 16.3.88 12.48.88c-6.6 0-11.92 5.32-11.92 11.92s5.32 11.92 11.92 11.92c6.2 0 11.22-4.12 11.22-11.38 0-.78-.08-1.48-.2-2.14z"
      ></path>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: 'Please check your email and password. If this is your first time, ensure data has been seeded.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };


  return (
    <>
      <Toaster />
      <div className="flex min-h-screen items-start justify-center bg-background p-4 pt-16">
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <HopeHubLogo className="h-20 w-20 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Hope Hub</CardTitle>
            <CardDescription>
              Sign in to connect with the Marvelous Men of Hope.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn}>
              <div className="grid gap-4">
                <Button variant="outline" type="button" disabled>
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="#" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center text-sm">
              <Separator className="mb-4" />
               <p className="text-muted-foreground">
                Having trouble logging in?
               </p>
               <Link href="/settings" className="underline text-primary">
                Download seed data from the Settings page
              </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
