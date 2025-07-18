
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { getEventById, signUpForEvent, getUserById, updateEvent, type Event, type User, type VolunteerRole } from '@/lib/data-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, HeartHandshake, CheckCircle, Star, Edit, PlusCircle, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

function getInitials(name: string) {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('');
}

// Use a subset of Event for editing to avoid passing around large non-serializable objects if needed.
type EditableEventState = Omit<Event, 'id' | 'signups' | 'createdAt'>;

function EventDetailsPageContent() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const currentUser = React.useContext(UserContext);
  
  const [event, setEvent] = React.useState<Event | null>(null);
  const [volunteers, setVolunteers] = React.useState<User[]>([]);
  const [isSignedUp, setIsSignedUp] = React.useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<EditableEventState | null>(null);
  
  const canEditEvent = currentUser?.role === 'Admin' || currentUser?.role === 'Creator';

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
          // Initialize editing state
          setEditingEvent({
            title: foundEvent.title,
            description: foundEvent.description,
            date: foundEvent.date,
            volunteerRoles: foundEvent.volunteerRoles
          });
        }
      };
      fetchEvent();
    }
  }, [params.id, currentUser]);

  const handleVolunteerSignUp = async () => {
    if (event && currentUser && !isSignedUp && event.volunteerRoles.length > 0) {
      const roleToSignUpFor = event.volunteerRoles[0];

      try {
        await signUpForEvent(event.id, currentUser.id, roleToSignUpFor.id);
        setIsSignedUp(true);
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

  // --- Edit Handlers ---
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingEvent) return;
    const { name, value } = e.target;
    setEditingEvent({ ...editingEvent, [name]: value });
  };

  const handleEditDateChange = (date: Date | undefined) => {
    if (!editingEvent) return;
    setEditingEvent({ ...editingEvent, date });
  };
  
  const handleEditRoleChange = (index: number, field: 'name' | 'points' | 'hours', value: string | number) => {
    if (!editingEvent) return;
    const updatedRoles = [...editingEvent.volunteerRoles];
    if (field === 'points' || field === 'hours') {
        updatedRoles[index][field] = Number(value) < 0 ? 0 : Number(value);
    } else {
        updatedRoles[index][field] = value as string;
    }
    setEditingEvent(prev => prev ? ({...prev, volunteerRoles: updatedRoles }) : null);
  };

  const addEditRole = () => {
     if (!editingEvent) return;
    setEditingEvent(prev => prev ? ({
        ...prev,
        volunteerRoles: [...prev.volunteerRoles, { id: uuidv4(), name: '', points: 0, hours: 0 }]
    }) : null);
  };

  const removeEditRole = (index: number) => {
    if (!editingEvent) return;
    const updatedRoles = editingEvent.volunteerRoles.filter((_, i) => i !== index);
    setEditingEvent(prev => prev ? ({ ...prev, volunteerRoles: updatedRoles }) : null);
  }

  const handleUpdateEvent = async () => {
    if (!event || !editingEvent) return;

    if (!editingEvent.title || !editingEvent.description || !editingEvent.date || editingEvent.volunteerRoles.length === 0) {
      toast({
        title: 'Incomplete Form',
        description: 'Please fill out all event details and add at least one volunteer role.',
        variant: 'destructive',
      });
      return;
    }
     if (editingEvent.volunteerRoles.some(role => !role.name || role.points <= 0 || role.hours <= 0)) {
        toast({
            title: 'Invalid Volunteer Roles',
            description: 'Please ensure all roles have a name and points/hours are greater than 0.',
            variant: 'destructive',
        });
        return;
    }

    try {
      await updateEvent(event.id, editingEvent);
      // Optimistically update the UI
      setEvent({ ...event, ...editingEvent });
      setIsEditDialogOpen(false);
      toast({
        title: 'Event Updated!',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error("Failed to update event:", error)
      toast({
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    }
  };


  if (!event || !editingEvent) {
    return (
        <div className="flex items-center justify-center h-full">
          <p>Loading event...</p>
        </div>
    );
  }

  return (
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Card>
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
                    <div key={role.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                        <span className="font-medium">{role.name}</span>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-amber-500 font-semibold">
                                <Star className="h-4 w-4 fill-current" />
                                <span>{role.points} Points</span>
                            </div>
                             <div className="flex items-center gap-1 text-blue-500 font-semibold">
                                <Clock className="h-4 w-4" />
                                <span>{role.hours} Hours</span>
                            </div>
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
          <CardFooter className="flex items-center gap-4">
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
            {canEditEvent && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg">
                    <Edit className="mr-2 h-5 w-5" />
                    Edit Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Event</DialogTitle>
                      <DialogDescription>
                        Make changes to the event details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          type="text"
                          id="title"
                          name="title"
                          value={editingEvent.title}
                          onChange={handleEditInputChange}
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
                                !editingEvent.date && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editingEvent.date ? format(editingEvent.date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={editingEvent.date}
                              onSelect={handleEditDateChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={editingEvent.description}
                          onChange={handleEditInputChange}
                          rows={4}
                        />
                      </div>
                       <div className="grid w-full gap-1.5">
                          <Label>Volunteer Roles, Points & Hours</Label>
                          <div className="space-y-2">
                            {editingEvent.volunteerRoles.map((role, index) => (
                                <div key={role.id} className="flex items-center gap-2">
                                    <Input 
                                        type="text"
                                        placeholder="Role Name"
                                        value={role.name}
                                        onChange={(e) => handleEditRoleChange(index, 'name', e.target.value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Points"
                                        value={role.points}
                                        onChange={(e) => handleEditRoleChange(index, 'points', e.target.value)}
                                        className="w-20"
                                    />
                                     <Input
                                        type="number"
                                        placeholder="Hours"
                                        value={role.hours}
                                        onChange={(e) => handleEditRoleChange(index, 'hours', e.target.value)}
                                        className="w-20"
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeEditRole(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={addEditRole} className="mt-2">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Role
                          </Button>
                       </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleUpdateEvent}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
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
