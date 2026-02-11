// Mock event data for demo purposes
// These match the events created on-chain via setup-demo.ts and add-more-events.ts
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

// Events matching on-chain data (May - September 2026)
export const MOCK_EVENTS: MockEvent[] = [
  // ===== MAY 2026 =====
  {
    id: '4',
    name: 'Digital Art Gallery Opening',
    description: 'Experience the intersection of art and technology at this exclusive gallery opening featuring NFT artists from around the world. Witness digital masterpieces displayed on cutting-edge screens.',
    date: new Date('2026-05-15T19:00:00+08:00'),
    venue: 'National Gallery Singapore',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-theater-1.jpg',
    category: 'Art',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 130,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '4-entry',
        tokenId: 6,
        name: 'Gallery Entry',
        price: 0.25,
        maxSupply: 150,
        sold: 45,
        description: 'General admission to all gallery floors',
      },
      {
        id: '4-collector',
        tokenId: 7,
        name: "Collector's Preview",
        price: 0.75,
        maxSupply: 50,
        sold: 12,
        description: 'Early access, champagne reception, meet the artists',
      },
    ],
  },
  {
    id: '5',
    name: 'APAC Startup Summit',
    description: 'Connect with the brightest minds in the APAC startup ecosystem. Pitch competitions, investor panels, and networking sessions with founders who have scaled to unicorn status.',
    date: new Date('2026-05-28T10:00:00+08:00'),
    venue: 'One Raffles Place',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-concert-1.jpg',
    category: 'Business',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 115,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '5-attendee',
        tokenId: 8,
        name: 'Attendee Pass',
        price: 0.4,
        maxSupply: 400,
        sold: 156,
        description: 'Access to all talks and exhibition area',
      },
      {
        id: '5-investor',
        tokenId: 9,
        name: 'Investor Circle',
        price: 1.5,
        maxSupply: 100,
        sold: 34,
        description: 'Exclusive investor lounge, deal flow sessions',
      },
      {
        id: '5-founder',
        tokenId: 10,
        name: "Founder's Table",
        price: 3.0,
        maxSupply: 50,
        sold: 8,
        description: 'Private dinner with keynote speakers, 1-on-1 mentorship',
      },
    ],
  },

  // ===== JUNE 2026 =====
  {
    id: '1',
    name: 'Singapore Tech Conference 2026',
    description: 'The premier technology conference in Southeast Asia. Join industry leaders, innovators, and developers for a day of cutting-edge talks, workshops, and networking opportunities focused on Web3, AI, and the future of tech.',
    date: new Date('2026-06-20T10:00:00+08:00'),
    venue: 'Marina Bay Sands Expo',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/hero-concert.jpg',
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
        sold: 89,
        description: 'Access to all main stage talks and exhibition area',
      },
      {
        id: '1-vip',
        tokenId: 1,
        name: 'VIP Access',
        price: 1.2,
        maxSupply: 100,
        sold: 23,
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
    imageUrl: '/src/assets/event-concert-1.jpg',
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
        sold: 234,
        description: 'General admission to all stages',
      },
      {
        id: '2-pvip',
        tokenId: 3,
        name: 'Premium VIP',
        price: 2.0,
        maxSupply: 200,
        sold: 67,
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
    transferEnabled: false,
    ticketTiers: [
      {
        id: '3-gp',
        tokenId: 4,
        name: 'Gamer Pass',
        price: 0.3,
        maxSupply: 300,
        sold: 178,
        description: 'Access to expo floor, demo stations, and public tournaments',
      },
      {
        id: '3-pro',
        tokenId: 5,
        name: 'Pro Gamer VIP',
        price: 1.0,
        maxSupply: 100,
        sold: 42,
        description: 'All access including pro tournaments, exclusive swag, and developer sessions',
      },
    ],
  },

  // ===== JULY 2026 =====
  {
    id: '6',
    name: 'Stand-Up Comedy Night',
    description: 'Laugh until you cry with Asia\'s top comedians. An evening of stand-up comedy featuring rising stars and established names from the regional comedy circuit.',
    date: new Date('2026-07-10T20:00:00+08:00'),
    venue: 'Capitol Theatre',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-theater-1.jpg',
    category: 'Entertainment',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 110,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '6-gen',
        tokenId: 11,
        name: 'General Seating',
        price: 0.2,
        maxSupply: 200,
        sold: 156,
        description: 'Standard theatre seating',
      },
      {
        id: '6-front',
        tokenId: 12,
        name: 'Front Row',
        price: 0.5,
        maxSupply: 50,
        sold: 38,
        description: 'Premium front row seats, prepare to be picked on!',
      },
    ],
  },
  {
    id: '7',
    name: 'Street Food Festival',
    description: 'A celebration of Asia\'s diverse culinary heritage. Sample dishes from over 50 hawker stalls, watch cooking demonstrations, and vote for your favorite flavors.',
    date: new Date('2026-07-25T14:00:00+08:00'),
    venue: 'Gardens by the Bay',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-concert-1.jpg',
    category: 'Food & Drink',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 100,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '7-day',
        tokenId: 13,
        name: 'Day Pass',
        price: 0.15,
        maxSupply: 1500,
        sold: 890,
        description: 'Entry to festival grounds (food purchased separately)',
      },
      {
        id: '7-vip',
        tokenId: 14,
        name: 'VIP Tasting',
        price: 0.6,
        maxSupply: 300,
        sold: 123,
        description: 'All-inclusive tasting tokens, priority queues, exclusive dishes',
      },
    ],
  },

  // ===== AUGUST 2026 =====
  {
    id: '8',
    name: 'APAC Esports Championship',
    description: 'Watch the best esports teams in Asia Pacific compete for glory. Featuring tournaments in League of Legends, Valorant, and Dota 2 with a massive prize pool.',
    date: new Date('2026-08-08T18:00:00+08:00'),
    venue: 'Singapore Indoor Stadium',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-sports-1.jpg',
    category: 'Esports',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 150,
    resaleEnabled: true,
    transferEnabled: false,
    ticketTiers: [
      {
        id: '8-spec',
        tokenId: 15,
        name: 'Spectator',
        price: 0.35,
        maxSupply: 600,
        sold: 412,
        description: 'General admission seating with screen views',
      },
      {
        id: '8-avip',
        tokenId: 16,
        name: 'Arena VIP',
        price: 1.0,
        maxSupply: 150,
        sold: 89,
        description: 'Floor seats, player signings, exclusive merchandise',
      },
    ],
  },
  {
    id: '9',
    name: 'Mindful Tech Retreat',
    description: 'Disconnect to reconnect. A full-day wellness experience designed for tech professionals. Meditation, yoga, digital detox workshops, and healthy cuisine.',
    date: new Date('2026-08-22T09:00:00+08:00'),
    venue: 'Capella Singapore',
    city: 'Sentosa',
    country: 'Singapore',
    imageUrl: '/src/assets/event-theater-1.jpg',
    category: 'Wellness',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 100,
    resaleEnabled: false,
    transferEnabled: false,
    ticketTiers: [
      {
        id: '9-zen',
        tokenId: 17,
        name: 'Full Day Experience',
        price: 1.2,
        maxSupply: 80,
        sold: 34,
        description: 'Complete wellness package including all sessions and meals',
      },
    ],
  },

  // ===== SEPTEMBER 2026 =====
  {
    id: '10',
    name: 'Crypto Documentary Premiere',
    description: 'World premiere of "The Decentralized Dream" - a documentary exploring the rise of cryptocurrency and its impact on global finance. Q&A with filmmakers and crypto pioneers.',
    date: new Date('2026-09-05T19:30:00+08:00'),
    venue: 'The Projector',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/hero-concert.jpg',
    category: 'Film',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 140,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '10-scr',
        tokenId: 18,
        name: 'Standard Screening',
        price: 0.3,
        maxSupply: 300,
        sold: 145,
        description: 'Movie screening with post-film Q&A',
      },
      {
        id: '10-red',
        tokenId: 19,
        name: 'Red Carpet',
        price: 0.9,
        maxSupply: 100,
        sold: 56,
        description: 'Red carpet entry, reserved premium seating, after-party access',
      },
    ],
  },
  {
    id: '11',
    name: 'Etherlink DevCon 2026',
    description: 'The official Etherlink developer conference. Deep-dive technical sessions, hackathons, protocol updates, and the chance to shape the future of the Etherlink ecosystem.',
    date: new Date('2026-09-19T10:00:00+08:00'),
    venue: 'NTUC Centre',
    city: 'Singapore',
    country: 'Singapore',
    imageUrl: '/src/assets/event-sports-1.jpg',
    category: 'Developer',
    organizer: '0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B',
    maxResalePercentage: 120,
    resaleEnabled: true,
    transferEnabled: true,
    ticketTiers: [
      {
        id: '11-dev',
        tokenId: 20,
        name: 'Developer Pass',
        price: 0.5,
        maxSupply: 350,
        sold: 189,
        description: 'All sessions, hackathon participation, swag bag',
      },
      {
        id: '11-wrk',
        tokenId: 21,
        name: 'Workshop Bundle',
        price: 1.0,
        maxSupply: 100,
        sold: 45,
        description: 'Developer pass + hands-on workshop sessions with core team',
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

// Mock resale listings for various events
export const MOCK_RESALE_LISTINGS: MockResaleListing[] = [
  // Singapore Tech Conference resales
  {
    id: "resale-1",
    eventId: "1",
    tierId: "1-vip",
    ticketId: 1042,
    seatId: "VIP-0042",
    originalPrice: 1.2,
    listingPrice: 1.68, // 140% of original (within 150% cap)
    seller: "0x1234567890abcdef1234567890abcdef12345678",
    listedAt: new Date("2026-02-15"),
  },
  {
    id: "resale-2",
    eventId: "1",
    tierId: "1-ga",
    ticketId: 156,
    seatId: "GA-0156",
    originalPrice: 0.5,
    listingPrice: 0.65, // 130% of original
    seller: "0xabcdef1234567890abcdef1234567890abcdef12",
    listedAt: new Date("2026-02-18"),
  },

  // Blockchain Music Festival resales
  {
    id: "resale-3",
    eventId: "2",
    tierId: "2-pvip",
    ticketId: 2089,
    seatId: "PVIP-0089",
    originalPrice: 2.0,
    listingPrice: 2.3, // 115% of original (within 120% cap)
    seller: "0x9876543210fedcba9876543210fedcba98765432",
    listedAt: new Date("2026-03-01"),
  },
  {
    id: "resale-4",
    eventId: "2",
    tierId: "2-std",
    ticketId: 2201,
    seatId: "STD-0201",
    originalPrice: 0.8,
    listingPrice: 0.92,
    seller: "0xfedcba9876543210fedcba9876543210fedcba98",
    listedAt: new Date("2026-03-05"),
  },

  // Web3 Gaming Expo resales
  {
    id: "resale-5",
    eventId: "3",
    tierId: "3-pro",
    ticketId: 5023,
    seatId: "PRO-0023",
    originalPrice: 1.0,
    listingPrice: 1.4, // 140% (within 150% cap)
    seller: "0x2468ace02468ace02468ace02468ace02468ace0",
    listedAt: new Date("2026-03-10"),
  },

  // APAC Startup Summit resales
  {
    id: "resale-6",
    eventId: "5",
    tierId: "5-investor",
    ticketId: 9015,
    seatId: "INV-0015",
    originalPrice: 1.5,
    listingPrice: 1.7, // ~113% (within 115% cap)
    seller: "0x13579bdf13579bdf13579bdf13579bdf13579bdf",
    listedAt: new Date("2026-03-15"),
  },

  // Stand-Up Comedy Night resales
  {
    id: "resale-7",
    eventId: "6",
    tierId: "6-front",
    ticketId: 12008,
    seatId: "FRT-0008",
    originalPrice: 0.5,
    listingPrice: 0.55, // 110% (at cap)
    seller: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    listedAt: new Date("2026-04-01"),
  },

  // Esports Championship resales
  {
    id: "resale-8",
    eventId: "8",
    tierId: "8-avip",
    ticketId: 16045,
    seatId: "AVIP-0045",
    originalPrice: 1.0,
    listingPrice: 1.45, // 145% (within 150% cap)
    seller: "0xcafebabecafebabecafebabecafebabecafebabe",
    listedAt: new Date("2026-04-20"),
  },

  // Crypto Documentary resales
  {
    id: "resale-9",
    eventId: "10",
    tierId: "10-red",
    ticketId: 19032,
    seatId: "RED-0032",
    originalPrice: 0.9,
    listingPrice: 1.2, // ~133% (within 140% cap)
    seller: "0xbeefcafebeefcafebeefcafebeefcafebeefcafe",
    listedAt: new Date("2026-05-01"),
  },

  // Etherlink DevCon resales
  {
    id: "resale-10",
    eventId: "11",
    tierId: "11-wrk",
    ticketId: 21012,
    seatId: "WRK-0012",
    originalPrice: 1.0,
    listingPrice: 1.15, // 115% (within 120% cap)
    seller: "0xc0ffee00c0ffee00c0ffee00c0ffee00c0ffee00",
    listedAt: new Date("2026-05-10"),
  },
];

// Helper to get resale listings for an event
export function getResaleListingsForEvent(eventId: string): MockResaleListing[] {
  return MOCK_RESALE_LISTINGS.filter((listing) => listing.eventId === eventId);
}
