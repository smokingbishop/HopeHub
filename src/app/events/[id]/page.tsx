'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { events, type Event } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, HeartHandshake } from 'lucide-react';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [event, setEvent] = React.useState<Event | null>(null);

  React.useEffect(() => {
    if (params.id) {
      const foundEvent = events.find((e) => e.id === params.id) || null;
      setEvent(foundEvent);
    }
  }, [params.id]);

  const handleVolunteerSignUp = () => {
    if (event) {
      toast({
        title: "You've signed up!",
        description: `Thanks for volunteering for ${event.title}.`,
      });
    }
  };

  if (!event) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <p>Event not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Card>
          <div className="relative h-64 w-full">
            <Image
              src="https://placehold.co/800x400.png"
              alt={event.title}
              className="object-cover rounded-t-lg"
              layout="fill"
              data-ai-hint="community event"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-3xl text-primary">{event.title}</CardTitle>
            <CardDescription>
              {event.date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">{event.description}</p>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Volunteers ({event.volunteers.length})
              </h3>
              <div className="flex flex-wrap gap-4">
                {event.volunteers.map((v) => (
                  <div key={v.id} className="flex flex-col items-center gap-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={v.avatar} />
                      <AvatarFallback>{v.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{v.name}</span>
                  </div>
                ))}
                {event.volunteers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No volunteers yet. Be the first!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleVolunteerSignUp}
              className="bg-accent hover:bg-accent/90"
              size="lg"
            >
              <HeartHandshake className="mr-2 h-5 w-5" />
              Sign Up to Volunteer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
