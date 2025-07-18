
import { collection, getDocs, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { mockUsers, mockEvents, mockAnnouncements, mockConversations } from './mock-data';

// A simple flag to prevent seeding more than once per session.
let seeded = false;

export async function seedData() {
  if (seeded) {
    console.log("Data has already been seeded in this session.");
    return;
  }
  console.log("Checking if seeding is needed...");

  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);

    if (usersSnapshot.empty) {
      console.log('Database is empty. Seeding data...');
      const batch = writeBatch(db);

      // Seed Users
      mockUsers.forEach(user => {
        const userRef = doc(db, 'users', user.id);
        batch.set(userRef, {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
        });
      });

      // Seed Events
      mockEvents.forEach(event => {
        const eventRef = doc(db, 'events', event.id);
        batch.set(eventRef, {
            title: event.title,
            description: event.description,
            date: Timestamp.fromDate(event.date),
            volunteerIds: event.volunteerIds
        });
      });

      // Seed Announcements
      mockAnnouncements.forEach(ann => {
        const annRef = doc(db, 'announcements', ann.id);
        batch.set(annRef, {
            title: ann.title,
            message: ann.message,
            startDate: Timestamp.fromDate(ann.startDate),
            endDate: Timestamp.fromDate(ann.endDate)
        });
      });
      
      // Seed Conversations
      mockConversations.forEach(convo => {
          const convoRef = doc(db, 'conversations', convo.id);
          batch.set(convoRef, {
              name: convo.name,
              participantIds: convo.participantIds
          });
          // Seed messages for each conversation
          convo.messages.forEach(msg => {
              const msgRef = doc(db, `conversations/${convo.id}/messages`, msg.id);
              batch.set(msgRef, {
                  senderId: msg.senderId,
                  text: msg.text,
                  timestamp: Timestamp.fromDate(msg.timestamp)
              })
          })
      })

      await batch.commit();
      console.log('Seeding complete.');
      seeded = true;
    } else {
        console.log("Database not empty. Skipping seed.");
        seeded = true; // Mark as seeded to avoid re-checking
    }
  } catch (error) {
    console.error("Error seeding data: ", error);
  }
}
