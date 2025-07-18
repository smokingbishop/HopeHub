
'use client';

import * as React from 'react';
import { AppLayout } from '@/components/app-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { volunteers, type Volunteer } from '@/lib/mock-data';
import Image from 'next/image';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

export default function MembersPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Members ({volunteers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volunteers.map((volunteer) => (
                <div key={volunteer.id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage asChild src={volunteer.avatar}>
                      <Image
                        src={volunteer.avatar}
                        alt={volunteer.name}
                        width={40}
                        height={40}
                        data-ai-hint="person"
                      />
                    </AvatarImage>
                    <AvatarFallback>
                      {getInitials(volunteer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{volunteer.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
