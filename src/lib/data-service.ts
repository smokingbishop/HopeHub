
import { db } from './firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, where, query, Timestamp, writeBatch, arrayUnion } from 'firebase/firestore';
import { auth } from './firebase';

// Data model interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Creator' | 'Member';
  lastSignedUpAt?: Date;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  createdAt: Date;
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
    lastSignedUpAt: data.lastSignedUpAt?.toDate(),
  };
}

// Helper function to convert Firestore doc to Event
function docToEvent(doc: any): Event {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    date: data.date.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(0), // For older events
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
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    return userSnapshot.docs.map(docToUser);
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if(userSnap.exists()){
        return docToUser(userSnap);
    }
    console.warn(`Could not find user with id: ${id}`);
    return null;
  } catch (error) {
    console.error(`Error fetching user by id ${id}:`, error);
    return null;
  }
}

export async function addMember(data: Omit<User, 'id' | 'avatar'>): Promise<User> {
  try {
    const usersCol = collection(db, 'users');
    const newDocRef = await addDoc(usersCol, {
        ...data,
        avatar: `https://placehold.co/100x100.png?text=${data.name.split(' ').map(n => n[0]).join('')}`
    });

    const newUser: User = {
        id: newDocRef.id,
        ...data,
        avatar: `https://placehold.co/100x100.png?text=${data.name.split(' ').map(n => n[0]).join('')}`
    }
    return newUser;
  } catch (error) {
    console.error("Error adding member: ", error);
    throw error;
  }
}

// Returns the currently authenticated user from this application's data model
export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    return null;
  }
  return getUserById(firebaseUser.uid);
}


// --- Event Functions ---
export async function getEvents(): Promise<Event[]> {
  try {
    const eventsCol = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCol);
    return eventSnapshot.docs.map(docToEvent);
  } catch (error) {
    console.error("Error fetching events: ", error);
    return [];
  }
}

export async function getEventsForUser(userId: string): Promise<Event[]> {
  try {
    const q = query(collection(db, 'events'), where('volunteerIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToEvent);
  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    return [];
  }
}

export async function getNewEventsSince(date: Date): Promise<Event[]> {
    try {
        const timestamp = Timestamp.fromDate(date);
        const q = query(collection(db, 'events'), where('createdAt', '>', timestamp));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(docToEvent);
    } catch (error) {
        console.error("Error fetching new events:", error);
        return [];
    }
}


export async function getEventById(id: string): Promise<Event | null> {
  try {
    const eventDocRef = doc(db, 'events', id);
    const eventSnap = await getDoc(eventDocRef);
    if(eventSnap.exists()){
        return docToEvent(eventSnap);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching event by id ${id}:`, error);
    return null;
  }
}

export async function createEvent(data: Omit<Event, 'id' | 'volunteerIds' | 'createdAt'>): Promise<Event> {
  try {
    const eventsCol = collection(db, 'events');
    const newEvent = {
        ...data,
        date: Timestamp.fromDate(data.date),
        createdAt: Timestamp.now(),
        volunteerIds: [] // Start with no volunteers
    };
    const newDocRef = await addDoc(eventsCol, newEvent);

    return {
        id: newDocRef.id,
        ...data,
        createdAt: newEvent.createdAt.toDate(),
        volunteerIds: []
    }
  } catch (error) {
    console.error("Error creating event: ", error);
    throw error;
  }
}

export async function signUpForEvent(eventId: string, userId: string): Promise<void> {
    try {
        const eventRef = doc(db, 'events', eventId);
        const userRef = doc(db, 'users', userId);

        const batch = writeBatch(db);

        // Add user to event's volunteers
        batch.update(eventRef, {
            volunteerIds: arrayUnion(userId)
        });

        // Update user's last sign up time
        batch.update(userRef, {
            lastSignedUpAt: Timestamp.now()
        });

        await batch.commit();
    } catch (error) {
        console.error(`Error signing up user ${userId} for event ${eventId}:`, error);
        throw error;
    }
}


// --- Announcement Functions ---
export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const announcementsCol = collection(db, 'announcements');
    const announcementSnapshot = await getDocs(announcementsCol);
    return announcementSnapshot.docs.map(docToAnnouncement);
  } catch (error) {
    console.error("Error fetching announcements: ", error);
    return [];
  }
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, 'announcements'),
      where('startDate', '<=', now),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToAnnouncement).filter(ann => ann.endDate >= now.toDate());
  } catch (error) {
    console.error("Error fetching active announcements: ", error);
    return [];
  }
}

export async function createAnnouncement(data: Omit<Announcement, 'id'>): Promise<Announcement> {
  try {
    const announcementsCol = collection(db, 'announcements');
    const newDocRef = await addDoc(announcementsCol, {
        ...data,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
    });
    return { id: newDocRef.id, ...data };
  } catch (error) {
    console.error("Error creating announcement: ", error);
    throw error;
  }
}


// --- Conversation & Message Functions ---
export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  try {
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
  } catch (error) {
    console.error("Error getting conversations for user: ", error);
    return [];
  }
}

export async function createConversation(name: string, participantIds: string[]): Promise<Conversation> {
  try {
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
  } catch (error) {
    console.error("Error creating conversation: ", error);
    throw error;
  }
}

export async function addMessageToConversation(conversationId: string, senderId: string, text: string): Promise<Message> {
  try {
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
  } catch (error) {
    console.error("Error adding message to conversation: ", error);
    throw error;
  }
}
