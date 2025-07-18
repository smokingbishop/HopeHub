export type Event = {
  id: string;
  title: string;
  date: Date;
  description: string;
  volunteers: Volunteer[];
};

export type Volunteer = {
  id: string;
  name: string;
  avatar: string;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export type Conversation = {
  id: string;
  name: string;
  participants: Volunteer[];
  messages: Message[];
}

const currentUser: Volunteer = { id: '0', name: 'Admin User', avatar: 'https://placehold.co/100x100.png?text=AU' };

export const volunteers: Volunteer[] = [
  { id: '1', name: 'John Doe', avatar: 'https://placehold.co/100x100.png?text=JD' },
  { id: '2', name: 'Jane Smith', avatar: 'https://placehold.co/100x100.png?text=JS' },
  { id: '3', name: 'Mike Johnson', avatar: 'https://placehold.co/100x100.png?text=MJ' },
  { id: '4', name: 'Emily Davis', avatar: 'https://placehold.co/100x100.png?text=ED' },
  { id: '5', name: 'Chris Lee', avatar: 'https://placehold.co/100x100.png?text=CL' },
];

export const events: Event[] = [
  {
    id: 'evt1',
    title: 'Community Food Drive',
    date: new Date(2024, 6, 20), // July 20, 2024
    description: 'Help us collect and distribute food to families in need. We will be stationed at the community center.',
    volunteers: [volunteers[0], volunteers[2], volunteers[4]],
  },
  {
    id: 'evt2',
    title: 'Charity Fun Run',
    date: new Date(2024, 7, 4), // August 4, 2024
    description: 'A 5k fun run to raise money for local shelters. Volunteers needed for registration, water stations, and finish line support.',
    volunteers: [volunteers[1], volunteers[3]],
  },
  {
    id: 'evt3',
    title: 'Park Cleanup Day',
    date: new Date(2024, 7, 10), // August 10, 2024
    description: 'Join us to help clean and beautify our local community park. Gloves and bags will be provided.',
    volunteers: [volunteers[0], volunteers[1], volunteers[2], volunteers[3]],
  },
    {
    id: 'evt4',
    title: 'Annual Gala Dinner',
    date: new Date(2024, 8, 14), // September 14, 2024
    description: 'Our biggest fundraising event of the year. Volunteers needed for setup, guest services, and teardown.',
    volunteers: [],
  },
];

export const conversations: Conversation[] = [
  {
    id: 'convo1',
    name: 'Gala Planning Committee',
    participants: [currentUser, volunteers[0], volunteers[3], volunteers[4]],
    messages: [
      { id: 'msg1', senderId: '1', text: "Hey team, let's finalize the catering options for the gala.", timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
      { id: 'msg2', senderId: '4', text: "I've received quotes from three vendors. I'll share them in the documents tab.", timestamp: new Date(new Date().setHours(new Date().getHours() - 2)) },
      { id: 'msg3', senderId: '0', text: "Perfect, thanks Emily! Let's review them by EOD tomorrow.", timestamp: new Date(new Date().setHours(new Date().getHours() - 1)) },
    ],
  },
  {
    id: 'convo2',
    name: 'John Doe',
    participants: [currentUser, volunteers[0]],
    messages: [
        { id: 'msg4', senderId: '1', text: "Hi, I had a question about the Fun Run route.", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)) },
        { id: 'msg5', senderId: '0', text: "Sure, what's up?", timestamp: new Date(new Date().setDate(new Date().getDate() - 2)) },
        { id: 'msg6', senderId: '1', text: "Is the final turn onto Main Street or Elm Street?", timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30))},
        { id: 'msg7', senderId: '0', text: "It's Main Street. The map in the event details is accurate.", timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 5))},
    ],
  },
    {
    id: 'convo3',
    name: 'Jane Smith',
    participants: [currentUser, volunteers[1]],
    messages: [
        { id: 'msg8', senderId: '0', text: "Hi Jane, just confirming you're still able to help with the Park Cleanup.", timestamp: new Date(new Date().setDate(new Date().getDate() - 3)) },
        { id: 'msg9', senderId: '1', text: "Yes, I'll be there! Looking forward to it.", timestamp: new Date(new Date().setDate(new Date().getDate() - 3)) },
    ],
  }
];
