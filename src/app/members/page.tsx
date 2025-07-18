
'use client';

import * as React from 'react';
import { MainApp, UserContext } from '../main-app';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUsers, addMember, updateMember, deleteMember, type User } from '@/lib/data-service';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type CreateUserInput } from '@/ai/flows/createUserFlow';


type NewMemberState = Omit<User, 'id' | 'avatar'>;

function getInitials(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

function MembersPageContent() {
  const [allMembers, setAllMembers] = React.useState<User[]>([]);
  const currentUser = React.useContext(UserContext);
  const { toast } = useToast();
  
  // State for Add Member dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newMember, setNewMember] = React.useState<CreateUserInput>({
    name: '',
    email: '',
    role: 'Member',
  });

  // State for Edit Member dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<User | null>(null);

  // State for Delete Member dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingMember, setDeletingMember] = React.useState<User | null>(null);


  React.useEffect(() => {
    async function fetchData() {
      const users = await getUsers();
      setAllMembers(users);
    }
    fetchData();
  }, []);

  const canManageMembers = currentUser?.role === 'Admin';

  // --- Add Member Handlers ---
  const handleNewMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewMemberRoleChange = (value: 'Admin' | 'Creator' | 'Member') => {
    setNewMember(prev => ({ ...prev, role: value }));
  };

  const handleAddMember = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      toast({
        title: 'Incomplete Form',
        description: 'Please provide a name and email for the new member.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const createdMember = await addMember(newMember);
      setAllMembers(prev => [...prev, createdMember]);
      setNewMember({ name: '', email: '', role: 'Member' });
      setIsAddDialogOpen(false);
      toast({
        title: 'Member Added!',
        description: `${createdMember.name} has been added and an invitation email will be sent.`,
      });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            title: 'Error Adding Member',
            description: `Could not add the member: ${errorMessage}`,
            variant: 'destructive',
        });
    }
  };

  // --- Edit Member Handlers ---
  const openEditDialog = (member: User) => {
    setEditingMember({ ...member });
    setIsEditDialogOpen(true);
  };
  
  const handleEditMemberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingMember) return;
    const { name, value } = e.target;
    setEditingMember(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleEditMemberRoleChange = (value: 'Admin' | 'Creator' | 'Member') => {
    if (!editingMember) return;
    setEditingMember(prev => prev ? { ...prev, role: value } : null);
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      await updateMember(editingMember.id, {
        name: editingMember.name,
        email: editingMember.email,
        role: editingMember.role
      });
      
      setAllMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
      
      setIsEditDialogOpen(false);
      setEditingMember(null);
      toast({
        title: "Member Updated",
        description: `${editingMember.name}'s details have been saved.`
      });
    } catch (error) {
       toast({
        title: 'Error Updating Member',
        description: 'Could not update the member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // --- Delete Member Handlers ---
  const openDeleteDialog = (member: User) => {
    setDeletingMember(member);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    try {
      await deleteMember(deletingMember.id);
      setAllMembers(prev => prev.filter(m => m.id !== deletingMember.id));
      setIsDeleteDialogOpen(false);
      setDeletingMember(null);
      toast({
        title: 'Member Deleted',
        description: `${deletingMember.name} has been removed from the system.`
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Member',
        description: 'Could not delete the member. Please try again.',
        variant: 'destructive',
      });
    }
  }


  const getBadgeVariant = (role: User['role']): 'default' | 'secondary' | 'outline' => {
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
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Members</h2>
           {canManageMembers && (
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Member</DialogTitle>
                    <DialogDescription>
                      This will create a user in Firebase Authentication and send them an invitation to set their password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={newMember.name}
                        onChange={handleNewMemberInputChange}
                      />
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="john.doe@example.com"
                        value={newMember.email}
                        onChange={handleNewMemberInputChange}
                      />
                    </div>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="role">Role</Label>
                       <Select onValueChange={handleNewMemberRoleChange} defaultValue={newMember.role}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Creator">Creator</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddMember}>Add Member</Button>
                  </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
                     <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant={getBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                   {canManageMembers && member.id !== currentUser?.id && (
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(member)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Edit Member Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Member</DialogTitle>
                    <DialogDescription>
                        Update the member's details below.
                    </DialogDescription>
                </DialogHeader>
                {editingMember && (
                    <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                type="text"
                                id="edit-name"
                                name="name"
                                value={editingMember.name}
                                onChange={handleEditMemberInputChange}
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="edit-email">Email Address</Label>
                            <Input
                                type="email"
                                id="edit-email"
                                name="email"
                                value={editingMember.email}
                                onChange={handleEditMemberInputChange}
                                disabled // Cannot change email as it's linked to Auth
                            />
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select 
                                onValueChange={handleEditMemberRoleChange} 
                                defaultValue={editingMember.role}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Member">Member</SelectItem>
                                    <SelectItem value="Creator">Creator</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdateMember}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Delete Member Alert Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                member's record from the database. This does not delete their authentication account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingMember(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMember}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
  );
}

export default function MembersPage() {
    return (
        <MainApp>
            <MembersPageContent />
        </MainApp>
    )
}
