
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AppLayout } from '@/components/app-layout';
import {
  Calendar,
  HeartHandshake,
  Megaphone,
  BarChart3,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Announcement, Event } from '@/lib/data-service';
import { getActiveAnnouncements, getEvents } from '@/lib/data-service';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [activeAnnouncements, setActiveAnnouncements] = React.useState<Announcement[]>([]);
  const [events, setEvents] = React.useState<Event[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const announcements = await getActiveAnnouncements();
      setActiveAnnouncements(announcements);
      const allEvents = await getEvents();
      setEvents(allEvents);
    }
    fetchData();
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Volunteer Hours
              </CardTitle>
              <HeartHandshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                View events calendar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                +2 since last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Member Engagement
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">High</div>
              <p className="text-xs text-muted-foreground">
                Based on recent activity
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                Stay up to date with the latest news.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAnnouncements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {announcement.message}
                    </p>
                    <span className="text-xs text-muted-foreground">
                       Posted {formatDistanceToNow(announcement.startDate)} ago
                    </span>
                  </div>
                </div>
              ))}
               <Button variant="outline" size="sm" asChild>
                  <Link href="/announcements">View all</Link>
                </Button>
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Upcoming Events</CardTitle>
              <CardDescription>
                Events you have signed up to volunteer for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Community Food Drive</p>
                  <p className="text-sm text-muted-foreground">
                    Saturday, July 20th
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events/evt1">View</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Charity Fun Run</p>
                  <p className="text-sm text-muted-foreground">
                    Sunday, August 4th
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/events/evt2">View</Link>
                </Button>
              </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/events">View all events</Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
