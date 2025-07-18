
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
import { Download, ArrowLeft } from 'lucide-react';
import { mockUsers, mockEvents, mockAnnouncements, mockConversations } from '@/lib/mock-data';
import Link from 'next/link';
import { HopeHubLogo } from '@/components/icons';

function SettingsPageContent() {
  
  const handleDownloadData = () => {
    const dataToDownload = {
      users: mockUsers,
      events: mockEvents,
      announcements: mockAnnouncements,
      conversations: mockConversations.map(convo => ({
        id: convo.id,
        name: convo.name,
        participantIds: convo.participantIds,
        // The sub-collection 'messages' will need to be imported separately
        // This structure prepares the top-level conversation documents
      })),
      // We will also export messages separately for easier import into subcollections
      messages: mockConversations.flatMap(convo => 
        convo.messages.map(msg => ({ ...msg, conversationId: convo.id }))
      )
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToDownload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "firestore-mock-data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <div className="absolute top-4 left-4">
         <Button variant="ghost" asChild>
            <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
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
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Use these tools to manage your application data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              If automatic data seeding fails, you can manually import the mock data.
              Download the JSON file and use a script or the Firebase console
              (with some modifications) to import it into your Firestore collections.
            </p>
            <Button onClick={handleDownloadData}>
              <Download className="mr-2" />
              Download Mock Data as JSON
            </Button>
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
