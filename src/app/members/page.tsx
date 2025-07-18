
'use client';

import * as React from 'react';
import { MainApp, UserContext } from '../main-app';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUsers, addMember, type User } from '@/lib/data-service';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type NewMemberState = Omit<User, 'id' | 'avatar'>;

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

function MembersPageContent() {
  const [allMembers, setAllMembers] = React.useState<User[]>([]);
  const currentUser = React.useContext(UserContext);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const [newMember, setNewMember] = React.useState<NewMemberState>({
    name: '',
    email: '',
    role: 'Member',
  });

  React.useEffect(() => {
    async function fetchData() {
      const users = await getUsers();
      setAllMembers(users);
    }
    fetchData();
  }, []);

  const canAddMember = currentUser?.role === 'Admin';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: 'Admin' | 'Creator' | 'Member') => {
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
      setIsDialogOpen(false);
      toast({
        title: 'Member Added!',
        description: `${createdMember.name} has been added.`,
      });
    } catch (error) {
      toast({
        title: 'Error Adding Member',
        description: 'Could not add the member. Please try again.',
        variant: 'destructive',
      });
    }
  };


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
           {canAddMember && (
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Member</DialogTitle>
                    <DialogDescription>
                      This will create a user document in Firestore. You will still need to create a corresponding user in Firebase Authentication.
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="role">Role</Label>
                       <Select onValueChange={handleRoleChange} defaultValue={newMember.role}>
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
                  </div>
                  <Badge variant={getBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
