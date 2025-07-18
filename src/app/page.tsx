
'use client';

import * as React from 'react';
import { MainApp, UserContext } from './main-app';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Calendar,
  HeartHandshake,
  Megaphone,
  Star,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Announcement, Event } from '@/lib/data-service';
import { getActiveAnnouncements, getEventsForUser, getNewEventsSince, getUserRewardPoints, getUserVolunteerHours, getUnreadMessagesCount } from '@/lib/data-service';
import { formatDistanceToNow } from 'date-fns';

function DashboardPageContent() {
  const currentUser = React.useContext(UserContext);
  const [activeAnnouncements, setActiveAnnouncements] = React.useState<Announcement[]>([]);
  const [myEvents, setMyEvents] = React.useState<Event[]>([]);
  const [newEventsCount, setNewEventsCount] = React.useState(0);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [rewardPoints, setRewardPoints] = React.useState(0);
  const [volunteerHours, setVolunteerHours] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      
      // Fetch active announcements
      const announcements = await getActiveAnnouncements();
      setActiveAnnouncements(announcements);

      // Fetch events user is signed up for
      const userEvents = await getEventsForUser(currentUser.id);
      setMyEvents(userEvents.sort((a, b) => a.date.getTime() - b.date.getTime()));

      // Fetch new event count
      if (currentUser.lastSignedUpAt) {
          const newEvents = await getNewEventsSince(currentUser.lastSignedUpAt);
          setNewEventsCount(newEvents.length);
      } else {
          // If user never signed up, all events are new
          const allEvents = await getActiveAnnouncements();
          setNewEventsCount(allEvents.length)
      }

      // Fetch user reward points
      const points = await getUserRewardPoints(currentUser.id);
      setRewardPoints(points);

      // Fetch user volunteer hours
      const hours = await getUserVolunteerHours(currentUser.id);
      setVolunteerHours(hours);
      
      // Fetch unread messages count
      const unreadCount = await getUnreadMessagesCount(currentUser.id);
      setUnreadMessages(unreadCount);
    }
    fetchData();
  }, [currentUser]);

  return (
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
              <div className="text-2xl font-bold">{volunteerHours}</div>
              <p className="text-xs text-muted-foreground">
                All time contribution
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newEventsCount}</div>
              <p className="text-xs text-muted-foreground">
                Since you last signed up
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                My Reward Points
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rewardPoints}</div>
              <p className="text-xs text-muted-foreground">
                Earned from volunteering
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unread Messages
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for you in your inbox
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
              {activeAnnouncements.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent announcements.</p>
              )}
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
              {myEvents.length > 0 ? myEvents.slice(0, 2).map(event => (
                <div key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${event.id}`}>View</Link>
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">You haven't signed up for any events yet.</p>
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/events">View all events</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

export default function DashboardPage() {
  return (
    <MainApp>
      <DashboardPageContent />
    </MainApp>
  )
}
