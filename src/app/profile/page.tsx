
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
import { updateMember } from '@/lib/data-service';
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
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Could not get canvas context'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Use JPEG for better compression
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for initial selection
         toast({
          title: 'Image too large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setAvatarFile(file);
      // Show a temporary preview
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);
    try {
      let newAvatarUrl = currentUser.avatar;

      if (avatarFile) {
        newAvatarUrl = await resizeImage(avatarFile);
      }
      
      await updateMember(currentUser.id, {
        name,
        avatar: newAvatarUrl,
      });

      // Optimistically update the UI state
      setAvatar(newAvatarUrl);
      
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
       console.error("Profile update error:", error);
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       toast({
        title: 'Error updating profile',
        description: `There was an issue saving your profile: ${errorMessage}`,
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
                <Avatar className="h-20 w-20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
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
                  <Label htmlFor="avatar-upload">Update Avatar</Label>
                  <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      ref={fileInputRef}
                      onChange={handleAvatarFileChange}
                      className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Choose Image...
                  </Button>
                  <p className="text-xs text-muted-foreground">Click the avatar or button to upload a new image.</p>
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
