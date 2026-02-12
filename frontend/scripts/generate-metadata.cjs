const fs = require('fs');
const path = require('path');

// Token metadata matching the on-chain events and tiers
const tokenMetadata = [
  // Event 0: Singapore Tech Conference 2026
  {
    tokenId: 0,
    name: "Singapore Tech Conference 2026 — General Admission",
    description: "General Admission ticket for Singapore Tech Conference 2026. Access to all main stage talks and exhibition area.",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Singapore Tech Conference 2026" },
      { trait_type: "Tier", value: "General Admission" },
      { trait_type: "Venue", value: "Marina Bay Sands Expo" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-06-20" },
      { trait_type: "Category", value: "Conference" }
    ]
  },
  {
    tokenId: 1,
    name: "Singapore Tech Conference 2026 — VIP Access",
    description: "VIP Access ticket for Singapore Tech Conference 2026. Priority seating, exclusive networking lounge, speaker meet & greet.",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Singapore Tech Conference 2026" },
      { trait_type: "Tier", value: "VIP Access" },
      { trait_type: "Venue", value: "Marina Bay Sands Expo" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-06-20" },
      { trait_type: "Category", value: "Conference" }
    ]
  },
  // Event 1: Blockchain Music Festival
  {
    tokenId: 2,
    name: "Blockchain Music Festival — Standard Entry",
    description: "Standard Entry ticket for Blockchain Music Festival. Full festival access with food & beverage vouchers.",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Blockchain Music Festival" },
      { trait_type: "Tier", value: "Standard Entry" },
      { trait_type: "Venue", value: "Clarke Quay Riverside" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-06-27" },
      { trait_type: "Category", value: "Music" }
    ]
  },
  {
    tokenId: 3,
    name: "Blockchain Music Festival — Premium VIP",
    description: "Premium VIP ticket for Blockchain Music Festival. Backstage pass, artist meet & greet, premium viewing deck.",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Blockchain Music Festival" },
      { trait_type: "Tier", value: "Premium VIP" },
      { trait_type: "Venue", value: "Clarke Quay Riverside" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-06-27" },
      { trait_type: "Category", value: "Music" }
    ]
  },
  // Event 2: Web3 Gaming Expo
  {
    tokenId: 4,
    name: "Web3 Gaming Expo — Gamer Pass",
    description: "Gamer Pass for Web3 Gaming Expo. Access to all demo stations, tournaments, and panels.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Web3 Gaming Expo" },
      { trait_type: "Tier", value: "Gamer Pass" },
      { trait_type: "Venue", value: "Suntec Convention Centre" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-06-30" },
      { trait_type: "Category", value: "Gaming" }
    ]
  },
  {
    tokenId: 5,
    name: "Web3 Gaming Expo — Pro Gamer VIP",
    description: "Pro Gamer VIP ticket for Web3 Gaming Expo. Early access, pro-player lounge, exclusive merch pack.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Web3 Gaming Expo" },
      { trait_type: "Tier", value: "Pro Gamer VIP" },
      { trait_type: "Venue", value: "Suntec Convention Centre" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-06-30" },
      { trait_type: "Category", value: "Gaming" }
    ]
  },
  // Event 3: Digital Art Gallery Opening
  {
    tokenId: 6,
    name: "Digital Art Gallery Opening — Gallery Entry",
    description: "Gallery Entry ticket for Digital Art Gallery Opening. General admission to all gallery floors.",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Digital Art Gallery Opening" },
      { trait_type: "Tier", value: "Gallery Entry" },
      { trait_type: "Venue", value: "National Gallery Singapore" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-05-15" },
      { trait_type: "Category", value: "Art" }
    ]
  },
  {
    tokenId: 7,
    name: "Digital Art Gallery Opening — Collector's Preview",
    description: "Collector's Preview ticket for Digital Art Gallery Opening. Early access, champagne reception, meet the artists.",
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Digital Art Gallery Opening" },
      { trait_type: "Tier", value: "Collector's Preview" },
      { trait_type: "Venue", value: "National Gallery Singapore" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-05-15" },
      { trait_type: "Category", value: "Art" }
    ]
  },
  // Event 4: APAC Startup Summit
  {
    tokenId: 8,
    name: "APAC Startup Summit — Attendee Pass",
    description: "Attendee Pass for APAC Startup Summit. Access to all talks and exhibition area.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "APAC Startup Summit" },
      { trait_type: "Tier", value: "Attendee Pass" },
      { trait_type: "Venue", value: "One Raffles Place" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-05-28" },
      { trait_type: "Category", value: "Business" }
    ]
  },
  {
    tokenId: 9,
    name: "APAC Startup Summit — Investor Circle",
    description: "Investor Circle ticket for APAC Startup Summit. Exclusive investor lounge, deal flow sessions.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "APAC Startup Summit" },
      { trait_type: "Tier", value: "Investor Circle" },
      { trait_type: "Venue", value: "One Raffles Place" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-05-28" },
      { trait_type: "Category", value: "Business" }
    ]
  },
  {
    tokenId: 10,
    name: "APAC Startup Summit — Founder's Table",
    description: "Founder's Table ticket for APAC Startup Summit. Private dinner with keynote speakers, 1-on-1 mentorship.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "APAC Startup Summit" },
      { trait_type: "Tier", value: "Founder's Table" },
      { trait_type: "Venue", value: "One Raffles Place" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-05-28" },
      { trait_type: "Category", value: "Business" }
    ]
  },
  // Event 5: Stand-Up Comedy Night
  {
    tokenId: 11,
    name: "Stand-Up Comedy Night — General Seating",
    description: "General Seating ticket for Stand-Up Comedy Night. Standard seating with one drink included.",
    image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Stand-Up Comedy Night" },
      { trait_type: "Tier", value: "General Seating" },
      { trait_type: "Venue", value: "Esplanade Theatre Studio" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-07-10" },
      { trait_type: "Category", value: "Comedy" }
    ]
  },
  {
    tokenId: 12,
    name: "Stand-Up Comedy Night — Front Row",
    description: "Front Row ticket for Stand-Up Comedy Night. Premium seating, free-flow drinks, post-show meet.",
    image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Stand-Up Comedy Night" },
      { trait_type: "Tier", value: "Front Row" },
      { trait_type: "Venue", value: "Esplanade Theatre Studio" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-07-10" },
      { trait_type: "Category", value: "Comedy" }
    ]
  },
  // Event 6: Street Food Festival
  {
    tokenId: 13,
    name: "Street Food Festival — Day Pass",
    description: "Day Pass for Street Food Festival. Full festival access, food sampling opportunities.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Street Food Festival" },
      { trait_type: "Tier", value: "Day Pass" },
      { trait_type: "Venue", value: "Sentosa Siloso Beach" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-07-25" },
      { trait_type: "Category", value: "Food & Drink" }
    ]
  },
  {
    tokenId: 14,
    name: "Street Food Festival — VIP Tasting",
    description: "VIP Tasting ticket for Street Food Festival. Unlimited tastings, chef demonstrations, exclusive area.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Street Food Festival" },
      { trait_type: "Tier", value: "VIP Tasting" },
      { trait_type: "Venue", value: "Sentosa Siloso Beach" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-07-25" },
      { trait_type: "Category", value: "Food & Drink" }
    ]
  },
  // Event 7: APAC Esports Championship
  {
    tokenId: 15,
    name: "APAC Esports Championship — Spectator",
    description: "Spectator ticket for APAC Esports Championship. Stadium seating, merchandise booth access.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "APAC Esports Championship" },
      { trait_type: "Tier", value: "Spectator" },
      { trait_type: "Venue", value: "Singapore Indoor Stadium" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-08-08" },
      { trait_type: "Category", value: "Esports" }
    ]
  },
  {
    tokenId: 16,
    name: "APAC Esports Championship — Arena VIP",
    description: "Arena VIP ticket for APAC Esports Championship. Front row gaming chairs, team meet & greet, exclusive merch.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "APAC Esports Championship" },
      { trait_type: "Tier", value: "Arena VIP" },
      { trait_type: "Venue", value: "Singapore Indoor Stadium" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-08-08" },
      { trait_type: "Category", value: "Esports" }
    ]
  },
  // Event 8: Mindful Tech Retreat
  {
    tokenId: 17,
    name: "Mindful Tech Retreat — Full Day Experience",
    description: "Full Day Experience ticket for Mindful Tech Retreat. Digital detox workshops, nature walks, wellness sessions.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Mindful Tech Retreat" },
      { trait_type: "Tier", value: "Full Day Experience" },
      { trait_type: "Venue", value: "Gardens by the Bay" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-08-22" },
      { trait_type: "Category", value: "Wellness" }
    ]
  },
  // Event 9: Crypto Documentary Premiere
  {
    tokenId: 18,
    name: "Crypto Documentary Premiere — Standard Screening",
    description: "Standard Screening ticket for Crypto Documentary Premiere. Movie viewing with post-film Q&A.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Crypto Documentary Premiere" },
      { trait_type: "Tier", value: "Standard Screening" },
      { trait_type: "Venue", value: "The Projector" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-09-05" },
      { trait_type: "Category", value: "Film" }
    ]
  },
  {
    tokenId: 19,
    name: "Crypto Documentary Premiere — Red Carpet",
    description: "Red Carpet ticket for Crypto Documentary Premiere. Red carpet entry, cocktail reception, director meet.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Crypto Documentary Premiere" },
      { trait_type: "Tier", value: "Red Carpet" },
      { trait_type: "Venue", value: "The Projector" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-09-05" },
      { trait_type: "Category", value: "Film" }
    ]
  },
  // Event 10: Etherlink DevCon
  {
    tokenId: 20,
    name: "Etherlink DevCon 2026 — Developer Pass",
    description: "Developer Pass for Etherlink DevCon 2026. Full access to all technical sessions and hackathon.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Etherlink DevCon 2026" },
      { trait_type: "Tier", value: "Developer Pass" },
      { trait_type: "Venue", value: "BLOCK71 Singapore" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-09-19" },
      { trait_type: "Category", value: "Developer" }
    ]
  },
  {
    tokenId: 21,
    name: "Etherlink DevCon 2026 — Workshop Bundle",
    description: "Workshop Bundle for Etherlink DevCon 2026. All workshops, hackathon prizes, swag bag, networking dinner.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    attributes: [
      { trait_type: "Event", value: "Etherlink DevCon 2026" },
      { trait_type: "Tier", value: "Workshop Bundle" },
      { trait_type: "Venue", value: "BLOCK71 Singapore" },
      { trait_type: "City", value: "Singapore" },
      { trait_type: "Date", value: "2026-09-19" },
      { trait_type: "Category", value: "Developer" }
    ]
  },
];

// Create metadata directory
const metadataDir = path.join(__dirname, '..', 'public', 'metadata');
if (!fs.existsSync(metadataDir)) {
  fs.mkdirSync(metadataDir, { recursive: true });
}

// Generate JSON files
tokenMetadata.forEach(token => {
  const filePath = path.join(metadataDir, `${token.tokenId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(token, null, 2));
  console.log(`Created: ${token.tokenId}.json - ${token.name}`);
});

console.log(`\nGenerated ${tokenMetadata.length} metadata files in ${metadataDir}`);
