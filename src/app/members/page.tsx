
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {volunteers.map((volunteer) => (
            <Card key={volunteer.id}>
              <CardHeader className="items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage asChild src={volunteer.avatar}>
                    <Image
                      src={volunteer.avatar}
                      alt={volunteer.name}
                      width={96}
                      height={96}
                      data-ai-hint="person"
                    />
                  </AvatarImage>
                  <AvatarFallback className="text-3xl">
                    {getInitials(volunteer.name)}
                  </AvatarFallback>
                </Avatar>
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle className="text-lg">{volunteer.name}</CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
