
'use client';

import * as React from 'react';
import Link from 'next/link';
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
import { getEvents, createEvent, type Event, type VolunteerRole } from '@/lib/data-service';
import { ArrowRight, PlusCircle, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

type NewEventState = {
  title: string;
  description: string;
  date: Date | undefined;
  volunteerRoles: VolunteerRole[];
};

function EventsPageContent() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const currentUser = React.useContext(UserContext);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const [newEvent, setNewEvent] = React.useState<NewEventState>({
    title: '',
    description: '',
    date: undefined,
    volunteerRoles: [],
  });

  React.useEffect(() => {
    async function fetchData() {
      const allEvents = await getEvents();
      setEvents(allEvents.sort((a,b) => a.date.getTime() - b.date.getTime()));
    }
    fetchData();
  }, []);
  
  const canCreateEvent = currentUser?.role === 'Admin' || currentUser?.role === 'Creator';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setNewEvent(prev => ({ ...prev, date }));
  };

  const handleRoleChange = (index: number, field: 'name' | 'points' | 'hours', value: string | number) => {
    const updatedRoles = [...newEvent.volunteerRoles];
    if (field === 'points' || field === 'hours') {
      updatedRoles[index][field] = Number(value) < 0 ? 0 : Number(value);
    } else {
      updatedRoles[index][field] = value as string;
    }
    setNewEvent(prev => ({...prev, volunteerRoles: updatedRoles }));
  };

  const addRole = () => {
    setNewEvent(prev => ({
        ...prev,
        volunteerRoles: [...prev.volunteerRoles, { id: uuidv4(), name: '', points: 0, hours: 0 }]
    }));
  };

  const removeRole = (index: number) => {
    const updatedRoles = newEvent.volunteerRoles.filter((_, i) => i !== index);
    setNewEvent(prev => ({ ...prev, volunteerRoles: updatedRoles }));
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description || !newEvent.date || newEvent.volunteerRoles.length === 0) {
      toast({
        title: 'Incomplete Form',
        description: 'Please fill out all event details and add at least one volunteer role.',
        variant: 'destructive',
      });
      return;
    }

    if (newEvent.volunteerRoles.some(role => !role.name || role.points <= 0 || role.hours <= 0)) {
        toast({
            title: 'Invalid Volunteer Roles',
            description: 'Please ensure all roles have a name, and points/hours are greater than 0.',
            variant: 'destructive',
        });
        return;
    }

    try {
      const createdEvent = await createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        volunteerRoles: newEvent.volunteerRoles,
      });
      setEvents(prev => [...prev, createdEvent].sort((a,b) => a.date.getTime() - b.date.getTime()));
      setNewEvent({ title: '', description: '', date: undefined, volunteerRoles: [] });
      setIsDialogOpen(false);
      toast({
        title: 'Event Created!',
        description: `${createdEvent.title} has been added to the calendar.`,
      });
    } catch (error) {
       toast({
        title: 'Error Creating Event',
        description: 'Could not create the event. Please try again.',
        variant: 'destructive',
      });
    }
  };


  return (
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Upcoming Events</h2>
          {canCreateEvent && (
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <form onSubmit={handleCreateEvent}>
                    <DialogHeader>
                      <DialogTitle>Create a New Event</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to add a new event to the calendar.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          type="text"
                          id="title"
                          name="title"
                          placeholder="E.g., Community Food Drive"
                          value={newEvent.title}
                          onChange={handleInputChange}
                        />
                      </div>
                       <div className="grid w-full gap-1.5">
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !newEvent.date && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newEvent.date ? format(newEvent.date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newEvent.date}
                              onSelect={handleDateChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          placeholder="Describe the event and what volunteers will be doing."
                          id="description"
                          name="description"
                          value={newEvent.description}
                          onChange={handleInputChange}
                          rows={4}
                        />
                      </div>
                       <div className="grid w-full gap-1.5">
                          <Label>Volunteer Roles, Points & Hours</Label>
                          <div className="space-y-2">
                            {newEvent.volunteerRoles.map((role, index) => (
                                <div key={role.id} className="flex items-center gap-2">
                                    <Input 
                                        type="text"
                                        placeholder="Role Name (e.g., Greeter)"
                                        value={role.name}
                                        onChange={(e) => handleRoleChange(index, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Points"
                                        value={role.points}
                                        onChange={(e) => handleRoleChange(index, 'points', e.target.value)}
                                        className="w-20"
                                    />
                                     <Input
                                        type="number"
                                        placeholder="Hours"
                                        value={role.hours}
                                        onChange={(e) => handleRoleChange(index, 'hours', e.target.value)}
                                        className="w-20"
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeRole(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={addRole} className="mt-2">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Role
                          </Button>
                       </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Create Event</Button>
                    </DialogFooter>
                  </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{event.title}</CardTitle>
                <CardDescription>
                  {event.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-3">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/events/${event.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
  );
}

export default function EventsPage() {
  return (
    <MainApp>
      <EventsPageContent />
    </MainApp>
  )
}
