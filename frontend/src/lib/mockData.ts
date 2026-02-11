// Mock event data for demo purposes
// These match the events created on-chain via setup-demo.ts
// Contract: 0x6eE88cA6958547131d6552d1626a8730b1FaF554

export interface MockEvent {
  id: string;
  name: string;
  description: string;
  date: Date;
  venue: string;
  city: string;
  country: string;
  imageUrl: string;
  category: string;
  organizer: string;
  ticketTiers: MockTicketTier[];
  maxResalePercentage: number;
  resaleEnabled: boolean;
  transferEnabled: boolean;
}

export interface MockTicketTier {
  id: string;
  tokenId: number;
  name: string;
  price: number; // in XTZ
  maxSupply: number;
  sold: number;
  description: string;
}

// Events matching on-chain data (June 2026)
export const MOCK_EVENTS: MockEvent[] = [
  {
    id: '1',
    name: 'Singapore Tech Conference 2026',
    description: 'The premier technology conference in Southeast Asia. Join industry leaders, innovators, and developers for a day of cutting-edge talks, workshops, and networking opportunities focused on Web3, AI, and the future of tech.',
    date: new Date('2026-06-20T10:00:00+08:00'),
    venue: 'Marina Bay Sands Expo',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-theater-1.jpg',
    category: 'Conference',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 150,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '1-ga',
        tokenId: 0,
        name: 'General Admission',
        price: 0.5,
        maxSupply: 300,
        sold: 0,
        description: 'Access to all main stage talks and exhibition area',
      },
      {
        id: '1-vip',
        tokenId: 1,
        name: 'VIP Access',
        price: 1.2,
        maxSupply: 100,
        sold: 0,
        description: 'Priority seating, exclusive networking lounge, speaker meet & greet',
      },
    ],
  },
  {
    id: '2',
    name: 'Blockchain Music Festival',
    description: 'An immersive music experience where blockchain meets beats. Featuring international DJs, live performances, and NFT art installations. Your ticket is your collectible.',
    date: new Date('2026-06-27T19:00:00+08:00'),
    venue: 'Sentosa Beach',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/hero-concert.jpg',
    category: 'Music',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 120,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '2-std',
        tokenId: 2,
        name: 'Standard Entry',
        price: 0.8,
        maxSupply: 700,
        sold: 0,
        description: 'General admission to all stages',
      },
      {
        id: '2-pvip',
        tokenId: 3,
        name: 'Premium VIP',
        price: 2.0,
        maxSupply: 200,
        sold: 0,
        description: 'VIP viewing areas, complimentary drinks, artist meet & greet',
      },
    ],
  },
  {
    id: '3',
    name: 'Web3 Gaming Expo',
    description: 'The ultimate gathering for Web3 gamers and developers. Play-to-earn demos, esports tournaments, exclusive game reveals, and hands-on experiences with the future of gaming.',
    date: new Date('2026-06-30T09:00:00+08:00'),
    venue: 'Suntec Convention Centre',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-sports-1.jpg',
    category: 'Gaming',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 150,
    resaleEnabled: true,
    transferEnabled: false, // Non-transferable tickets
    ticketTiers: [
      {
        id: '3-gp',
        tokenId: 4,
        name: 'Gamer Pass',
        price: 0.3,
        maxSupply: 300,
        sold: 0,
        description: 'Access to expo floor, demo stations, and public tournaments',
      },
      {
        id: '3-pro',
        tokenId: 5,
        name: 'Pro Gamer VIP',
        price: 1.0,
        maxSupply: 100,
        sold: 0,
        description: 'All access including pro tournaments, exclusive swag, and developer sessions',
      },
    ],
  },
];

// Helper function to get event by ID
export function getEventById(id: string): MockEvent | undefined {
  return MOCK_EVENTS.find(event => event.id === id);
}

// Helper to format XTZ price
export function formatXTZ(amount: number): string {
  return `${amount.toFixed(2)} XTZ`;
}

// Helper to check if event is sold out
export function isEventSoldOut(event: MockEvent): boolean {
  return event.ticketTiers.every(tier => tier.sold >= tier.maxSupply);
}

// Helper to get tickets remaining for a tier
export function getTicketsRemaining(tier: MockTicketTier): number {
  return tier.maxSupply - tier.sold;
}

// Mock resale listings
export interface MockResaleListing {
  id: string;
  eventId: string;
  tierId: string;
  ticketId: number;
  seatId: string;
  originalPrice: number;
  listingPrice: number;
  seller: string;
  listedAt: Date;
}

// Empty resale listings for demo (fresh contract has no resales yet)
export const MOCK_RESALE_LISTINGS: MockResaleListing[] = [];

// Helper to get resale listings for an event
export function getResaleListingsForEvent(eventId: string): MockResaleListing[] {
  return MOCK_RESALE_LISTINGS.filter((listing) => listing.eventId === eventId);
}
