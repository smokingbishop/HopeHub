
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HopeHubLogo } from '@/components/icons';

function SettingsPageContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <div className="absolute top-4 left-4">
         <Button variant="ghost" asChild>
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
         </Button>
       </div>

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
            <HopeHubLogo className="h-20 w-20 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Manage your application settings here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Future settings and data management tools will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
      <SettingsPageContent />
  );
}
