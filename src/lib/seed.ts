import { collection, getDocs, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { mockUsers, mockEvents, mockAnnouncements, mockConversations } from './mock-data';

// This function will now check Firestore every time to see if data exists.
// The in-memory `seeded` flag has been removed for reliability during setup.
export async function seedData() {
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
    } else {
        console.log("Database not empty. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding data: ", error);
  }
}
