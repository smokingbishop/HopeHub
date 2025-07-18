
'use client';

import * as React from 'react';
import { MainApp, UserContext } from '../main-app';
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
import { useToast } from '@/hooks/use-toast';
import { updateMember, getUserById, type User } from '@/lib/data-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';

function getInitials(name: string) {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('');
}


function ProfilePageContent() {
  const currentUser = React.useContext(UserContext);
  const { toast } = useToast();
  
  const [name, setName] = React.useState(currentUser?.name || '');
  const [avatar, setAvatar] = React.useState(currentUser?.avatar || '');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      await updateMember(currentUser.id, { name, avatar });

      // Optimistically update context or force a refresh.
      // For now, we just show a toast, a full solution might involve updating the UserContext.
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!currentUser) {
    return null; // Or a loading state
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8">
      <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
      <Card className="max-w-2xl">
        <form onSubmit={handleProfileUpdate}>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Update your personal information here. Your email address cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage asChild src={avatar}>
                      <Image
                        src={avatar}
                        alt={name}
                        width={80}
                        height={80}
                        data-ai-hint="person"
                      />
                    </AvatarImage>
                    <AvatarFallback>
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                        id="avatar"
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://example.com/avatar.png"
                    />
                </div>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser.email}
                disabled
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <MainApp>
      <ProfilePageContent />
    </MainApp>
  );
}
