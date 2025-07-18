
export type MockEvent = {
  id: string;
  title: string;
  date: Date;
  description: string;
  volunteerIds: string[];
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Creator' | 'Member';
};

export type MockMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export type MockConversation = {
  id: string;
  name: string;
  participantIds: string[];
  messages: MockMessage[];
}

export type MockAnnouncement = {
  id: string;
  title: string;
  message: string;
  startDate: Date;
  endDate: Date;
};

// IMPORTANT: The 'id' for users here should match the UID of the user in your Firebase Auth.
// I've used a placeholder for the admin user. You should replace 'your-admin-uid-from-firebase'
// with the actual UID of your admin user from the Firebase Authentication console.
export const mockUsers: MockUser[] = [
  { id: 'BhlKYjrL0lQU96ze7vaVeYtn6cr1', name: 'Admin User', email: 'smokingbishop@gmail.com', avatar: 'https://placehold.co/100x100.png?text=AU', role: 'Admin' },
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', avatar: 'https://placehold.co/100x100.png?text=JD', role: 'Member' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://placehold.co/100x100.png?text=JS', role: 'Creator' },
  { id: 'user-3', name: 'Mike Johnson', email: 'mike@example.com', avatar: 'https://placehold.co/100x100.png?text=MJ', role: 'Member' },
  { id: 'user-4', name: 'Emily Davis', email: 'emily@example.com', avatar: 'https://placehold.co/100x100.png?text=ED', role: 'Member' },
  { id: 'user-5', name: 'Chris Lee', email: 'chris@example.com', avatar: 'https://placehold.co/100x100.png?text=CL', role: 'Member' },
];

export const mockEvents: MockEvent[] = [
  {
    id: 'evt1',
    title: 'Community Food Drive',
    date: new Date(2024, 6, 20), // July 20, 2024
    description: 'Help us collect and distribute food to families in need. We will be stationed at the community center.',
    volunteerIds: ['user-1', 'user-3', 'user-5'],
  },
  {
    id: 'evt2',
    title: 'Charity Fun Run',
    date: new Date(2024, 7, 4), // August 4, 2024
    description: 'A 5k fun run to raise money for local shelters. Volunteers needed for registration, water stations, and finish line support.',
    volunteerIds: ['user-2', 'user-4'],
  },
  {
    id: 'evt3',
    title: 'Park Cleanup Day',
    date: new Date(2024, 7, 10), // August 10, 2024
    description: 'Join us to help clean and beautify our local community park. Gloves and bags will be provided.',
    volunteerIds: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
    {
    id: 'evt4',
    title: 'Annual Gala Dinner',
    date: new Date(2024, 8, 14), // September 14, 2024
    description: 'Our biggest fundraising event of the year. Volunteers needed for setup, guest services, and teardown.',
    volunteerIds: [],
  },
];

export const mockConversations: MockConversation[] = [
  {
    id: 'convo1',
    name: 'Gala Planning Committee',
    participantIds: ['3QO5rGxpB8hWdJ2b2rqiIu25C9G2', 'user-1', 'user-4', 'user-5'],
    messages: [
      { id: 'msg1', senderId: 'user-1', text: "Hey team, let's finalize the catering options for the gala.", timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
      { id: 'msg2', senderId: 'user-4', text: "I've received quotes from three vendors. I'll share them in the documents tab.", timestamp: new Date(new Date().setHours(new Date().getHours() - 2)) },
      { id: 'msg3', senderId: '3QO5rGxpB8hWdJ2b2rqiIu25C9G2', text: "Perfect, thanks Emily! Let's review them by EOD tomorrow.", timestamp: new Date(new Date().setHours(new Date().getHours() - 1)) },
    ],
  },
  {
    id: 'convo2',
    name: 'John Doe',
    participantIds: ['3QO5rGxpB8hWdJ2b2rqiIu25C9G2', 'user-1'],
    messages: [
        { id: 'msg4', senderId: 'user-1', text: "Hi, I had a question about the Fun Run route.", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)) },
        { id: 'msg5', senderId: '3QO5rGxpB8hWdJ2b2rqiIu25C9G2', text: "Sure, what's up?", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)) },
        { id: 'msg6', senderId: 'user-1', text: "Is the final turn onto Main Street or Elm Street?", timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30))},
        { id: 'msg7', senderId: '3QO5rGxpB8hWdJ2b2rqiIu25C9G2', text: "It's Main Street. The map in the event details is accurate.", timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 5))},
    ],
  },
    {
    id: 'convo3',
    name: 'Jane Smith',
    participantIds: ['3QO5rGxpB8hWdJ2b2rqiIu25C9G2', 'user-2'],
    messages: [
        { id: 'msg8', senderId: '3QO5rGxpB8hWdJ2b2rqiIu25C9G2', text: "Hi Jane, just confirming you're still able to help with the Park Cleanup.", timestamp: new Date(new Date().setDate(new Date().getDate() - 3)) },
        { id: 'msg9', senderId: 'user-2', text: "Yes, I'll be there! Looking forward to it.", timestamp: new Date(new Date().setDate(new Date().getDate() - 3)) },
    ],
  }
];

export const mockAnnouncements: MockAnnouncement[] = [
  {
    id: 'ann1',
    title: 'Annual Gala Dinner',
    message: 'Tickets are now on sale for our biggest event of the year!',
    startDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
  },
  {
    id: 'ann2',
    title: 'Call for Volunteers',
    message: 'We need your help for the upcoming charity run. Sign up in the events tab.',
    startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
  },
  {
    id: 'ann3',
    title: 'New Member Welcome',
    message: 'Please give a warm welcome to our newest members!',
    startDate: new Date(new Date().setDate(new Date().getDate() - 10)),
    endDate: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
];
