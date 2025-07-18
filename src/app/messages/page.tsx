
'use client';

import * as React from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  getConversationsForUser, 
  createConversation, 
  getUsers, 
  getCurrentUser, 
  addMessageToConversation,
  type Conversation, 
  type User,
  type Message
} from '@/lib/data-service';
import { cn } from '@/lib/utils';
import { Send, Users, ArrowLeft, PlusCircle } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('');
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [isClient, setIsClient] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newConvoTitle, setNewConvoTitle] = React.useState('');
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [messageText, setMessageText] = React.useState('');

  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
    async function fetchData() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const userConversations = await getConversationsForUser(user.id);
        setConversations(userConversations);
        if (userConversations.length > 0) {
            setSelectedConversation(userConversations[0]);
        }
      }
      const users = await getUsers();
      setAllUsers(users);
    }
    fetchData();
  }, []);

  const getParticipant = (senderId: string): User | undefined => {
    return selectedConversation?.participants.find(p => p.id === senderId);
  }

  const formatTimestamp = (date: Date) => {
    if (!isClient) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateConversation = async () => {
    if (!currentUser) return;
    
    if (selectedMemberIds.length === 0) {
      toast({ title: "No members selected", description: "Please select at least one member.", variant: "destructive" });
      return;
    }

    if (selectedMemberIds.length > 1 && !newConvoTitle) {
      toast({ title: "Title required", description: "Please provide a title for the group chat.", variant: "destructive" });
      return;
    }
    
    const participantIds = [...selectedMemberIds, currentUser.id];
    const memberObjects = allUsers.filter(u => participantIds.includes(u.id));
    
    let convoName = newConvoTitle;
    if (selectedMemberIds.length === 1 && !newConvoTitle) {
      convoName = allUsers.find(m => m.id === selectedMemberIds[0])?.name || "New Chat";
    }

    try {
        const newConversation = await createConversation(convoName, participantIds);
        newConversation.participants = memberObjects; // Manually add participants for immediate UI update

        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setNewConvoTitle('');
        setSelectedMemberIds([]);
        setIsDialogOpen(false);
        toast({ title: "Conversation created!", description: `You can now start messaging with ${convoName}.` });
    } catch (error) {
        toast({ title: "Error", description: "Could not create conversation.", variant: 'destructive'})
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !currentUser) return;
    try {
      const newMessage = await addMessageToConversation(selectedConversation.id, currentUser.id, messageText);
      const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage]
      };
      setSelectedConversation(updatedConversation);

      // Update the main list of conversations
      setConversations(prev => prev.map(c => c.id === updatedConversation.id ? updatedConversation : c));
      
      setMessageText('');
    } catch(error) {
       toast({ title: "Error", description: "Could not send message.", variant: 'destructive'})
    }
  }


  return (
    <AppLayout>
      <div className="flex h-full border-t">
        <aside
          className={cn(
            'w-full md:w-1/3 lg:w-1/4 h-full border-r flex-col md:flex',
            selectedConversation ? 'hidden' : 'flex'
          )}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <PlusCircle className="h-5 w-5" />
                  <span className="sr-only">New Message</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                  <DialogDescription>
                    Select members to start a new chat. Add a title for group conversations.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title (optional for 1-on-1)</Label>
                    <Input id="title" value={newConvoTitle} onChange={e => setNewConvoTitle(e.target.value)} placeholder="E.g., Event Planning Team" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Members</Label>
                    <ScrollArea className="h-48 rounded-md border p-2">
                      <div className="space-y-2">
                        {allUsers.filter(u => u.id !== currentUser?.id).map(member => (
                          <div key={member.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`member-${member.id}`} 
                              checked={selectedMemberIds.includes(member.id)}
                              onCheckedChange={() => handleMemberSelect(member.id)}
                            />
                            <Label htmlFor={`member-${member.id}`} className="font-normal flex items-center gap-2">
                               <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                               </Avatar>
                               {member.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleCreateConversation}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea className="flex-1">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  'flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50',
                  selectedConversation?.id === convo.id && 'bg-muted'
                )}
                onClick={() => setSelectedConversation(convo)}
              >
                <Avatar>
                  <AvatarFallback>{convo.participants.length > 2 ? <Users className="h-5 w-5"/> : getInitials(convo.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="font-semibold">{convo.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(convo.messages[convo.messages.length - 1].timestamp)}
                </span>
              </div>
            ))}
          </ScrollArea>
        </aside>
        <Separator orientation="vertical" className="h-full hidden md:block" />
        <section
          className={cn(
            'flex-1 flex-col h-full md:flex',
            selectedConversation ? 'flex' : 'hidden'
          )}
        >
          {selectedConversation ? (
            <>
              <CardHeader className="flex flex-row items-center gap-3 border-b">
                 <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                    <ArrowLeft className="h-5 w-5"/>
                 </Button>
                 <Avatar>
                   <AvatarFallback>{selectedConversation.participants.length > 2 ? <Users className="h-5 w-5"/> : getInitials(selectedConversation.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedConversation.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedConversation.participants.map(p => p.name).join(', ')}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-220px)] p-4 lg:p-6">
                  <div className="space-y-4">
                  {selectedConversation.messages.map((message, index) => {
                    const sender = getParticipant(message.senderId);
                    const isCurrentUser = message.senderId === currentUser?.id;
                    return (
                        <div key={index} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                           {!isCurrentUser && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={sender?.avatar} />
                               <AvatarFallback>{sender ? getInitials(sender.name) : 'U'}</AvatarFallback>
                             </Avatar>
                           )}
                           <div className={cn("max-w-xs lg:max-w-md p-3 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs text-right mt-1 opacity-70">
                                {formatTimestamp(message.timestamp)}
                            </p>
                           </div>
                         </div>
                    )
                  })}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="flex w-full items-center space-x-2">
                  <Textarea
                    placeholder="Type a message..."
                    className="min-h-0 resize-none"
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button type="submit" size="icon" onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
                <h3 className="text-xl font-semibold">Select a conversation</h3>
                <p className="text-muted-foreground">
                    Choose from your existing conversations to start chatting.
                </p>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
