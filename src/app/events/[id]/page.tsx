
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MainApp, UserContext } from '../../main-app';
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
import { getEventById, signUpForEvent, getUserById, type Event, type User } from '@/lib/data-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, HeartHandshake, CheckCircle, Star } from 'lucide-react';

function getInitials(name: string) {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('');
}

function EventDetailsPageContent() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const currentUser = React.useContext(UserContext);
  const [event, setEvent] = React.useState<Event | null>(null);
  const [volunteers, setVolunteers] = React.useState<User[]>([]);
  const [isSignedUp, setIsSignedUp] = React.useState(false);

  React.useEffect(() => {
    if (params.id && currentUser) {
      const eventId = params.id as string;
      const fetchEvent = async () => {
        const foundEvent = await getEventById(eventId);
        setEvent(foundEvent);
        if (foundEvent) {
          const volunteerDetails = await Promise.all(
            foundEvent.signups.map(signup => getUserById(signup.userId))
          );
          setVolunteers(volunteerDetails.filter(v => v !== null) as User[]);

          if (foundEvent.signups.some(s => s.userId === currentUser.id)) {
            setIsSignedUp(true);
          }
        }
      };
      fetchEvent();
    }
  }, [params.id, currentUser]);

  const handleVolunteerSignUp = async () => {
    // For now, we sign up for the first available role.
    // A more advanced implementation would let the user choose a role.
    if (event && currentUser && !isSignedUp && event.volunteerRoles.length > 0) {
      const roleToSignUpFor = event.volunteerRoles[0];

      try {
        await signUpForEvent(event.id, currentUser.id, roleToSignUpFor.id);
        setIsSignedUp(true);
        // Add current user to volunteers list for immediate UI update
        setVolunteers(prev => [...prev, currentUser]);
        toast({
          title: "You've signed up!",
          description: `Thanks for volunteering for ${event.title}.`,
        });
      } catch (error) {
        toast({
            title: "Sign-up Failed",
            description: "Could not sign you up for the event. Please try again.",
            variant: "destructive"
        })
      }
    }
  };

  if (!event) {
    return (
        <div className="flex items-center justify-center h-full">
          <p>Loading event...</p>
        </div>
    );
  }

  const signedUpUserIds = event.signups.map(s => s.userId);

  return (
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
                Volunteer Roles
              </h3>
              <div className="space-y-2">
                {event.volunteerRoles.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        <span className="font-medium">{role.name}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{role.points} Points</span>
                        </div>
                    </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Volunteers ({volunteers.length})
              </h3>
              <div className="flex flex-wrap gap-4">
                {volunteers.length > 0 ? volunteers.map((v) => (
                  <div key={v.id} className="flex flex-col items-center gap-2 text-center w-20">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={v.avatar} />
                      <AvatarFallback>{getInitials(v.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate w-full">{v.name}</span>
                  </div>
                )) : (
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
              className={!isSignedUp ? 'bg-accent hover:bg-accent/90' : 'bg-green-600 hover:bg-green-700'}
              size="lg"
              disabled={isSignedUp || event.volunteerRoles.length === 0}
            >
              {isSignedUp ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  You're signed up!
                </>
              ) : (
                <>
                  <HeartHandshake className="mr-2 h-5 w-5" />
                  Sign Up to Volunteer
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
  );
}

export default function EventDetailsPage() {
    return (
        <MainApp>
            <EventDetailsPageContent />
        </MainApp>
    )
}
