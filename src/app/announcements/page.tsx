
'use client';

import * as React from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { announcements, type Announcement, currentUser } from '@/lib/mock-data';
import { CalendarIcon, Megaphone, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

type NewAnnouncementState = {
  title: string;
  message: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
};

export default function AnnouncementsPage() {
  const { toast } = useToast();
  const [newAnnouncement, setNewAnnouncement] = React.useState<NewAnnouncementState>({
    title: '',
    message: '',
    startDate: undefined,
    endDate: undefined,
  });
  const [allAnnouncements, setAllAnnouncements] = React.useState(announcements);

  const canCreateAnnouncement = currentUser.role === 'Admin' || currentUser.role === 'Creator';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAnnouncement((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    setNewAnnouncement(prev => ({ ...prev, [field]: date }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncement.title && newAnnouncement.message && newAnnouncement.startDate && newAnnouncement.endDate) {
       if (newAnnouncement.endDate < newAnnouncement.startDate) {
        toast({
          title: 'Invalid Date Range',
          description: 'End date cannot be before the start date.',
          variant: 'destructive',
        });
        return;
      }
      const newEntry: Announcement = {
        id: `ann${allAnnouncements.length + 1}`,
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        startDate: newAnnouncement.startDate,
        endDate: newAnnouncement.endDate,
      };
      setAllAnnouncements([newEntry, ...allAnnouncements]);
      setNewAnnouncement({ title: '', message: '', startDate: undefined, endDate: undefined });
      toast({
        title: 'Announcement Posted!',
        description: 'Your announcement is now visible to all members.',
      });
    } else {
        toast({
            title: 'Incomplete Form',
            description: 'Please fill out all fields, including start and end dates.',
            variant: 'destructive',
        });
    }
  };
  
  const activeAnnouncements = allAnnouncements.filter(ann => {
    const now = new Date();
    return ann.startDate <= now && ann.endDate >= now;
  }).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        </div>
        <div className={cn("grid gap-6", canCreateAnnouncement ? "md:grid-cols-2" : "md:grid-cols-1")}>
          {canCreateAnnouncement && (
            <Card>
              <CardHeader>
                <CardTitle>Post a New Announcement</CardTitle>
                <CardDescription>
                  This will be visible to all members on their dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      type="text" 
                      id="title" 
                      name="title" 
                      placeholder="E.g., Upcoming Maintenance" 
                      value={newAnnouncement.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      placeholder="Type your message here." 
                      id="message" 
                      name="message"
                      value={newAnnouncement.message}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !newAnnouncement.startDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newAnnouncement.startDate ? format(newAnnouncement.startDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newAnnouncement.startDate}
                            onSelect={(date) => handleDateChange(date, 'startDate')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="endDate">End Date</Label>
                       <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !newAnnouncement.endDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newAnnouncement.endDate ? format(newAnnouncement.endDate, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newAnnouncement.endDate}
                            onSelect={(date) => handleDateChange(date, 'endDate')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <Button type="submit">
                    <Send className="mr-2" />
                    Post Announcement
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          <Card className={cn(!canCreateAnnouncement && "col-span-full")}>
            <CardHeader>
              <CardTitle>Active Announcements</CardTitle>
              <CardDescription>
                Here are the latest updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAnnouncements.map((announcement) => (
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
                <p className="text-sm text-muted-foreground">No active announcements.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
