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
import { conversations, type Conversation, type Volunteer } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Send, Users, ArrowLeft } from 'lucide-react';

function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('');
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] =
    React.useState<Conversation | null>(conversations[0]);
    
  const getParticipant = (senderId: string): Volunteer | undefined => {
    return selectedConversation?.participants.find(p => p.id === senderId);
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
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
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
                  <p className="text-sm text-muted-foreground truncate">
                    {convo.messages[convo.messages.length - 1].text}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {convo.messages[convo.messages.length - 1].timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    const isCurrentUser = message.senderId === '0'; // Assuming '0' is current user
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
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  />
                  <Button type="submit" size="icon">
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
