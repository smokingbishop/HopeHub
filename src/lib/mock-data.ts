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

const volunteers: Volunteer[] = [
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
