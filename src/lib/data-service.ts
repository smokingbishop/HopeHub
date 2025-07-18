
import { db } from './firebase';
import { collection, getDocs, getDoc, doc, addDoc, setDoc, where, query, Timestamp, writeBatch } from 'firebase/firestore';

// Data model interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Creator' | 'Member';
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  description: string;
  volunteerIds: string[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  startDate: Date;
  endDate: Date;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  name: string;
  participantIds: string[];
  participants: User[];
  messages: Message[];
}

// Helper function to convert Firestore doc to User
function docToUser(doc: any): User {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role,
  };
}

// Helper function to convert Firestore doc to Event
function docToEvent(doc: any): Event {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    date: data.date.toDate(),
    description: data.description,
    volunteerIds: data.volunteerIds,
  };
}

// Helper function to convert Firestore doc to Announcement
function docToAnnouncement(doc: any): Announcement {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    message: data.message,
    startDate: data.startDate.toDate(),
    endDate: data.endDate.toDate(),
  };
}

// Helper function to convert Firestore doc to Message
function docToMessage(doc: any): Message {
    const data = doc.data();
    return {
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        timestamp: data.timestamp.toDate(),
    }
}

// --- User Functions ---
export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  return userSnapshot.docs.map(docToUser);
}

export async function getUserById(id: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if(userSnap.exists()){
        return docToUser(userSnap);
    }
    return null;
}

// Mock current user - replace with real auth later
export async function getCurrentUser(): Promise<User | null> {
  return getUserById('user-0');
}


// --- Event Functions ---
export async function getEvents(): Promise<Event[]> {
  const eventsCol = collection(db, 'events');
  const eventSnapshot = await getDocs(eventsCol);
  return eventSnapshot.docs.map(docToEvent);
}

export async function getEventById(id: string): Promise<Event | null> {
    const eventDocRef = doc(db, 'events', id);
    const eventSnap = await getDoc(eventDocRef);
    if(eventSnap.exists()){
        return docToEvent(eventSnap);
    }
    return null;
}

export async function createEvent(data: Omit<Event, 'id' | 'volunteerIds'>): Promise<Event> {
    const eventsCol = collection(db, 'events');
    const newDocRef = await addDoc(eventsCol, {
        ...data,
        date: Timestamp.fromDate(data.date),
        volunteerIds: [] // Start with no volunteers
    });

    const newEventData = {
        id: newDocRef.id,
        ...data,
        volunteerIds: []
    }
    return newEventData;
}


// --- Announcement Functions ---
export async function getAnnouncements(): Promise<Announcement[]> {
  const announcementsCol = collection(db, 'announcements');
  const announcementSnapshot = await getDocs(announcementsCol);
  return announcementSnapshot.docs.map(docToAnnouncement);
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'announcements'),
    where('startDate', '<=', now),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToAnnouncement).filter(ann => ann.endDate >= now.toDate());
}

export async function createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Announcement> {
    const announcementsCol = collection(db, 'announcements');
    const newDocRef = await addDoc(announcementsCol, {
        ...data,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
    });
    return { id: newDocRef.id, ...data };
}


// --- Conversation & Message Functions ---
export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
    const q = query(collection(db, 'conversations'), where('participantIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    const conversations = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        
        const participants = await Promise.all(
          data.participantIds.map((pid: string) => getUserById(pid))
        ) as User[];
        
        const messagesCol = collection(db, `conversations/${d.id}/messages`);
        const messagesSnapshot = await getDocs(messagesCol);
        const messages = messagesSnapshot.docs.map(docToMessage).sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime());

        return {
            id: d.id,
            name: data.name,
            participantIds: data.participantIds,
            participants: participants.filter(p => p != null),
            messages: messages
        }
    }));
    return conversations;
}

export async function createConversation(name: string, participantIds: string[]): Promise<Conversation> {
    const conversationsCol = collection(db, 'conversations');
    const newDocRef = await addDoc(conversationsCol, {
        name,
        participantIds,
    });
    
    // Add a starting message
    await addMessageToConversation(newDocRef.id, participantIds[0], `Started conversation: ${name}`);

    const newConvo = await getDoc(newDocRef);
    const data = newConvo.data()!;

    return {
        id: newDocRef.id,
        name: data.name,
        participantIds: data.participantIds,
        participants: [], // Will be populated in the component
        messages: [] // Will be populated in the component
    }
}

export async function addMessageToConversation(conversationId: string, senderId: string, text: string): Promise<Message> {
    const messagesCol = collection(db, `conversations/${conversationId}/messages`);
    const timestamp = Timestamp.now();
    const newDocRef = await addDoc(messagesCol, {
        senderId,
        text,
        timestamp
    });

    return {
        id: newDocRef.id,
        senderId,
        text,
        timestamp: timestamp.toDate()
    }
}
