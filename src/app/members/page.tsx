
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
import { volunteers, currentUser, type Volunteer } from '@/lib/mock-data';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

export default function MembersPage() {
  const allMembers: Volunteer[] = [
    currentUser,
    ...volunteers,
  ];

  const getBadgeVariant = (role: Volunteer['role']): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'Creator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Members ({allMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage asChild src={member.avatar}>
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={40}
                        height={40}
                        data-ai-hint="person"
                      />
                    </AvatarImage>
                    <AvatarFallback>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                  </div>
                  <Badge variant={getBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
