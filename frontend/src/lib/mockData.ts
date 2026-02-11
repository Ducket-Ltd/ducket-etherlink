// Mock event data for demo purposes
// In production, this would come from on-chain data or an indexer

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

// Sample events for APAC region (Fortify Labs focus)
export const MOCK_EVENTS: MockEvent[] = [
  {
    id: '1',
    name: 'Hong Kong Web3 Summit 2025',
    description: 'The premier Web3 conference in Asia featuring talks from industry leaders, workshops, and networking opportunities. Join us for two days of cutting-edge blockchain innovation.',
    date: new Date('2025-04-15T09:00:00+08:00'),
    venue: 'Hong Kong Convention Centre',
    city: 'Hong Kong',
    country: 'Hong Kong SAR',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    category: 'Conference',
    organizer: '0x1234...5678',
    maxResalePercentage: 120,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '1-ga',
        tokenId: 0,
        name: 'General Admission',
        price: 0.5,
        maxSupply: 500,
        sold: 234,
        description: 'Access to all main stage talks and exhibition area',
      },
      {
        id: '1-vip',
        tokenId: 1,
        name: 'VIP Pass',
        price: 2.0,
        maxSupply: 100,
        sold: 67,
        description: 'Priority seating, exclusive networking lounge, speaker meet & greet',
      },
    ],
  },
  {
    id: '2',
    name: 'Clockenflap Music Festival',
    description: 'Hong Kong\'s biggest outdoor music festival returns with an incredible lineup of international and local artists across multiple stages.',
    date: new Date('2025-03-08T14:00:00+08:00'),
    venue: 'Central Harbourfront',
    city: 'Hong Kong',
    country: 'Hong Kong SAR',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    category: 'Music',
    organizer: '0xabcd...efgh',
    maxResalePercentage: 110,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '2-day',
        tokenId: 2,
        name: 'Single Day Pass',
        price: 0.8,
        maxSupply: 2000,
        sold: 1456,
        description: 'One day access to all stages',
      },
      {
        id: '2-weekend',
        tokenId: 3,
        name: 'Weekend Pass',
        price: 2.2,
        maxSupply: 1000,
        sold: 823,
        description: 'Full weekend access with fast-track entry',
      },
    ],
  },
  {
    id: '3',
    name: 'Singapore FinTech Festival',
    description: 'Asia\'s largest fintech event bringing together the global fintech community for a week of innovation, insights, and connections.',
    date: new Date('2025-05-20T08:00:00+08:00'),
    venue: 'Singapore Expo',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
    category: 'Conference',
    organizer: '0x9876...5432',
    maxResalePercentage: 115,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '3-standard',
        tokenId: 4,
        name: 'Standard',
        price: 1.0,
        maxSupply: 3000,
        sold: 2100,
        description: 'Main conference access',
      },
      {
        id: '3-premium',
        tokenId: 5,
        name: 'Premium',
        price: 3.5,
        maxSupply: 500,
        sold: 312,
        description: 'All access including workshops and VIP lounge',
      },
    ],
  },
  {
    id: '4',
    name: 'Tokyo Game Show 2025',
    description: 'The world\'s largest gaming expo featuring the latest games, esports tournaments, and exclusive announcements from top publishers.',
    date: new Date('2025-09-25T10:00:00+09:00'),
    venue: 'Makuhari Messe',
    city: 'Tokyo',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800',
    category: 'Gaming',
    organizer: '0xdef0...1234',
    maxResalePercentage: 100, // No markup allowed
    resaleEnabled: true,
    transferEnabled: false, // Non-transferable
    ticketTiers: [
      {
        id: '4-public',
        tokenId: 6,
        name: 'Public Day',
        price: 0.3,
        maxSupply: 10000,
        sold: 8500,
        description: 'General admission for public days',
      },
      {
        id: '4-business',
        tokenId: 7,
        name: 'Business Pass',
        price: 1.5,
        maxSupply: 2000,
        sold: 1200,
        description: 'Access to business days and networking events',
      },
    ],
  },
  {
    id: '5',
    name: 'Bali Blockchain Week',
    description: 'A week-long celebration of blockchain technology in paradise. Conferences, hackathons, and beach parties with the Web3 community.',
    date: new Date('2025-06-10T09:00:00+08:00'),
    venue: 'Potato Head Beach Club',
    city: 'Bali',
    country: 'Indonesia',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    category: 'Conference',
    organizer: '0x5678...9abc',
    maxResalePercentage: 150,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '5-builder',
        tokenId: 8,
        name: 'Builder Pass',
        price: 0.4,
        maxSupply: 800,
        sold: 456,
        description: 'Conference access + hackathon participation',
      },
      {
        id: '5-whale',
        tokenId: 9,
        name: 'Whale Pass',
        price: 5.0,
        maxSupply: 50,
        sold: 42,
        description: 'All-inclusive VIP experience with accommodation',
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
