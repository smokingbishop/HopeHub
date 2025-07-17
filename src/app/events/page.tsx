'use client';

import * as React from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { cn } from '@/lib/utils';
import { HeartHandshake, Calendar as CalendarIcon } from 'lucide-react';

export default function EventsPage() {
  const { toast } = useToast();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);

  React.useEffect(() => {
    if (date) {
      const eventOnDate =
        events.find(
          (event) => event.date.toDateString() === date.toDateString()
        ) || null;
      setSelectedEvent(eventOnDate);
    }
  }, [date]);

  const handleVolunteerSignUp = () => {
    if (selectedEvent) {
      toast({
        title: "You've signed up!",
        description: `Thanks for volunteering for ${selectedEvent.title}.`,
      });
    }
  };

  const eventDays = events.map((event) => event.date);

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Events Calendar</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  modifiers={{
                    events: eventDays,
                  }}
                  modifiersClassNames={{
                    events: 'bg-primary/20 text-primary-foreground rounded-full',
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="min-h-[400px]">
              {selectedEvent ? (
                <>
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary">
                      {selectedEvent.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedEvent.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>{selectedEvent.description}</p>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Volunteers ({selectedEvent.volunteers.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.volunteers.map((v) => (
                           <div key={v.id} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                             <Avatar className="h-6 w-6">
                               <AvatarImage src={v.avatar} />
                               <AvatarFallback>{v.name.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <span className="text-sm font-medium">{v.name}</span>
                           </div>
                        ))}
                         {selectedEvent.volunteers.length === 0 && (
                            <p className="text-sm text-muted-foreground">No volunteers yet. Be the first!</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleVolunteerSignUp}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <HeartHandshake className="mr-2 h-4 w-4" />
                      Sign Up to Volunteer
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <CalendarIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold">Select a Date</h3>
                  <p className="text-muted-foreground">
                    Choose a date on the calendar to see event details.
                    <br />
                    Dates with events are highlighted.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
