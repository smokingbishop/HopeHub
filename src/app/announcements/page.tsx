
'use client';

import * as React from 'react';
import { MainApp, UserContext } from '../main-app';
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
import { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement, type Announcement } from '@/lib/data-service';
import { CalendarIcon, Megaphone, Send, Edit, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type NewAnnouncementState = {
  title: string;
  message: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
};

const getDefaultEndDate = (startDate: Date | undefined) => {
  if (!startDate) return undefined;
  return addDays(startDate, 7);
}

function AnnouncementsPageContent() {
  const { toast } = useToast();
  const currentUser = React.useContext(UserContext);
  
  const [newAnnouncement, setNewAnnouncement] = React.useState<NewAnnouncementState>({
    title: '',
    message: '',
    startDate: new Date(),
    endDate: getDefaultEndDate(new Date()),
  });
  const [allAnnouncements, setAllAnnouncements] = React.useState<Announcement[]>([]);

  // State for creating
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // State for editing
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
  
  // State for deleting
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = React.useState<Announcement | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const announcements = await getAnnouncements();
      setAllAnnouncements(announcements.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()));
    }
    fetchData();
  }, []);

  const canManageAnnouncements = currentUser?.role === 'Admin' || currentUser?.role === 'Creator';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAnnouncement((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    if (field === 'startDate') {
        setNewAnnouncement(prev => ({...prev, startDate: date, endDate: getDefaultEndDate(date)}));
    } else {
        setNewAnnouncement(prev => ({ ...prev, [field]: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      try {
        const newEntry = await createAnnouncement({
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          startDate: newAnnouncement.startDate,
          endDate: newAnnouncement.endDate,
        });
        setAllAnnouncements(prev => [newEntry, ...prev].sort((a,b) => b.startDate.getTime() - a.startDate.getTime()));
        const defaultStartDate = new Date();
        setNewAnnouncement({ title: '', message: '', startDate: defaultStartDate, endDate: getDefaultEndDate(defaultStartDate) });
        setIsAddDialogOpen(false);
        toast({
          title: 'Announcement Posted!',
          description: 'Your announcement is now visible to all members.',
        });
      } catch (error) {
        console.error("Error creating announcement:", error);
        toast({
          title: 'Error',
          description: 'Could not create announcement. Please try again.',
          variant: 'destructive'
        })
      }
    } else {
        toast({
            title: 'Incomplete Form',
            description: 'Please fill out all fields, including start and end dates.',
            variant: 'destructive',
        });
    }
  };

  // --- Edit Handlers ---
  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement({ ...announcement });
    setIsEditDialogOpen(true);
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingAnnouncement) return;
    const { name, value } = e.target;
    setEditingAnnouncement(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleEditDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
    if (!editingAnnouncement) return;
    setEditingAnnouncement(prev => prev ? { ...prev, [field]: date } : null);
  };
  
  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement) return;
    
    if (editingAnnouncement.endDate < editingAnnouncement.startDate) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date cannot be before the start date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateAnnouncement(editingAnnouncement.id, {
        title: editingAnnouncement.title,
        message: editingAnnouncement.message,
        startDate: editingAnnouncement.startDate,
        endDate: editingAnnouncement.endDate,
      });
      setAllAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? editingAnnouncement : a).sort((a,b) => b.startDate.getTime() - a.startDate.getTime()));
      setIsEditDialogOpen(false);
      setEditingAnnouncement(null);
      toast({
        title: 'Announcement Updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast({
        title: 'Update Failed',
        description: 'Could not save your changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // --- Delete Handlers ---
  const openDeleteDialog = (announcement: Announcement) => {
    setDeletingAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteAnnouncement = async () => {
    if (!deletingAnnouncement) return;

    try {
      await deleteAnnouncement(deletingAnnouncement.id);
      setAllAnnouncements(prev => prev.filter(a => a.id !== deletingAnnouncement.id));
      setIsDeleteDialogOpen(false);
      setDeletingAnnouncement(null);
      toast({
        title: 'Announcement Deleted',
        description: 'The announcement has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Announcement',
        description: 'Could not delete the announcement. Please try again.',
        variant: 'destructive',
      });
    }
  }
  

  return (
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
           {canManageAnnouncements && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post Announcement
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Post a New Announcement</DialogTitle>
                        <DialogDescription>
                            This will be visible to all members on their dashboard.
                        </DialogDescription>
                    </DialogHeader>
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
                       <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">
                                <Send className="mr-2 h-4 w-4" />
                                Post Announcement
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
          )}
        </div>
        <Card>
            <CardHeader>
              <CardTitle>All Announcements</CardTitle>
              <CardDescription>
                Here are the latest updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allAnnouncements.map((announcement) => (
                 <div key={announcement.id} className="flex items-start gap-4">
                   <div className="bg-primary/10 p-2 rounded-full">
                     <Megaphone className="h-5 w-5 text-primary" />
                   </div>
                   <div className="flex-1">
                     <p className="font-medium">{announcement.title}</p>
                     <p className="text-sm text-muted-foreground">
                       {announcement.message}
                     </p>
                      <span className="text-xs text-muted-foreground">
                        Posted {formatDistanceToNow(announcement.startDate)} ago
                      </span>
                   </div>
                   {canManageAnnouncements && (
                    <div className="flex items-center">
                       <Button variant="ghost" size="icon" onClick={() => openEditDialog(announcement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(announcement)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                   )}
                 </div>
              ))}
              {allAnnouncements.length === 0 && (
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              )}
            </CardContent>
          </Card>

        {/* Edit Announcement Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Announcement</DialogTitle>
                    <DialogDescription>
                        Update the announcement details below.
                    </DialogDescription>
                </DialogHeader>
                {editingAnnouncement && (
                    <div className="space-y-4 pt-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input 
                          type="text" 
                          id="edit-title" 
                          name="title" 
                          value={editingAnnouncement.title}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="edit-message">Message</Label>
                        <Textarea 
                          id="edit-message" 
                          name="message"
                          value={editingAnnouncement.message}
                          onChange={handleEditInputChange}
                        />
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={'outline'} className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editingAnnouncement.startDate ? format(editingAnnouncement.startDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={editingAnnouncement.startDate} onSelect={(date) => handleEditDateChange(date, 'startDate')} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid w-full gap-1.5">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={'outline'} className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editingAnnouncement.endDate ? format(editingAnnouncement.endDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={editingAnnouncement.endDate} onSelect={(date) => handleEditDateChange(date, 'endDate')} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdateAnnouncement}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

         {/* Delete Announcement Alert Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this announcement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingAnnouncement(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAnnouncement}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
  );
}


export default function AnnouncementsPage() {
  return (
    <MainApp>
      <AnnouncementsPageContent />
    </MainApp>
  );
}
