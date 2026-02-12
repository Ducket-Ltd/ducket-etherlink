import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.VITE_CONTRACT_ADDRESS || "0x3F82833474353588bC8527CC9faeCD190008100D";

  console.log("Setting up demo data on contract:", contractAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "XTZ\n");

  // Connect to deployed contract
  const contract = await ethers.getContractAt("EventTicketNFTV2", contractAddress);

  // Check if events already exist
  try {
    const existingEvent = await contract.getEvent(0);
    if (existingEvent.exists) {
      console.log("⚠️ Events already exist on this contract!");
      console.log("Event 0:", existingEvent.name);
      return;
    }
  } catch {
    // Event doesn't exist, proceed with setup
  }

  // Event dates in late June 2026
  // June 20, 2026 at 10:00 AM SGT (UTC+8)
  const june20_2026 = Math.floor(new Date("2026-06-20T10:00:00+08:00").getTime() / 1000);
  // June 27, 2026 at 7:00 PM SGT
  const june27_2026 = Math.floor(new Date("2026-06-27T19:00:00+08:00").getTime() / 1000);
  // June 30, 2026 at 9:00 AM SGT
  const june30_2026 = Math.floor(new Date("2026-06-30T09:00:00+08:00").getTime() / 1000);

  console.log("Creating Event 1: Singapore Tech Conference 2026...");
  // createEvent(name, eventDate, maxResalePercentage, maxTicketsPerWallet, totalSupply, resaleEnabled, transferEnabled)
  let tx = await contract.createEvent(
    "Singapore Tech Conference 2026",
    june20_2026,  // June 20, 2026
    150,             // 150% max resale (50% markup allowed)
    4,               // max 4 tickets per wallet
    500,             // total supply
    true,            // resale enabled
    true             // transfers enabled
  );
  await tx.wait();
  console.log("✅ Event 1 created (eventId: 0)");

  // Add ticket tiers for Event 1
  // createTicketTier(eventId, name, seatPrefix, price, tierMaxSupply)
  console.log("  Adding General Admission tier...");
  tx = await contract.createTicketTier(
    0,                              // eventId
    "General Admission",            // name
    "GA",                           // seatPrefix
    ethers.parseEther("0.5"),       // 0.5 XTZ
    300                             // max supply
  );
  await tx.wait();
  console.log("  ✅ Tier created (tokenId: 0) - General Admission @ 0.5 XTZ");

  console.log("  Adding VIP tier...");
  tx = await contract.createTicketTier(
    0,                              // eventId
    "VIP Access",                   // name
    "VIP",                          // seatPrefix
    ethers.parseEther("1.2"),       // 1.2 XTZ
    100                             // max supply
  );
  await tx.wait();
  console.log("  ✅ Tier created (tokenId: 1) - VIP Access @ 1.2 XTZ");

  console.log("\nCreating Event 2: Blockchain Music Festival...");
  tx = await contract.createEvent(
    "Blockchain Music Festival",
    june27_2026,  // June 27, 2026
    120,             // 120% max resale (20% markup allowed)
    6,               // max 6 tickets per wallet
    1000,            // total supply
    true,            // resale enabled
    true             // transfers enabled
  );
  await tx.wait();
  console.log("✅ Event 2 created (eventId: 1)");

  console.log("  Adding Standard tier...");
  tx = await contract.createTicketTier(
    1,                              // eventId
    "Standard Entry",               // name
    "STD",                          // seatPrefix
    ethers.parseEther("0.8"),       // 0.8 XTZ
    700                             // max supply
  );
  await tx.wait();
  console.log("  ✅ Tier created (tokenId: 2) - Standard Entry @ 0.8 XTZ");

  console.log("  Adding Premium tier...");
  tx = await contract.createTicketTier(
    1,                              // eventId
    "Premium VIP",                  // name
    "PVIP",                         // seatPrefix
    ethers.parseEther("2.0"),       // 2.0 XTZ
    200                             // max supply
  );
  await tx.wait();
  console.log("  ✅ Tier created (tokenId: 3) - Premium VIP @ 2.0 XTZ");

  console.log("\nCreating Event 3: Web3 Gaming Expo...");
  tx = await contract.createEvent(
    "Web3 Gaming Expo",
    june30_2026,  // June 30, 2026
    150,             // 150% max resale
    4,               // max 4 tickets per wallet
    400,             // total supply
    true,            // resale enabled
    false            // transfers disabled (non-transferable)
  );
  await tx.wait();
  console.log("✅ Event 3 created (eventId: 2)");

  console.log("  Adding Gamer Pass tier...");
  tx = await contract.createTicketTier(
    2,                              // eventId
    "Gamer Pass",                   // name
    "GP",                           // seatPrefix
    ethers.parseEther("0.3"),       // 0.3 XTZ
    300                             // max supply
  );
  await tx.wait();
  console.log("  ✅ Tier created (tokenId: 4) - Gamer Pass @ 0.3 XTZ");

  console.log("  Adding Pro Gamer tier...");
  tx = await contract.createTicketTier(
    2,                              // eventId
    "Pro Gamer VIP",                // name
    "PRO",                          // seatPrefix
    ethers.parseEther("1.0"),       // 1.0 XTZ
    100                             // max supply
  );
  await tx.wait();
  console.log("  ✅ Tier created (tokenId: 5) - Pro Gamer VIP @ 1.0 XTZ");

  console.log("\n=================================");
  console.log("✅ Demo setup complete!");
  console.log("=================================\n");
  console.log("Summary:");
  console.log("- Event 0: Singapore Tech Conference 2026 (June 20)");
  console.log("  - Token 0: General Admission (0.5 XTZ)");
  console.log("  - Token 1: VIP Access (1.2 XTZ)");
  console.log("- Event 1: Blockchain Music Festival (June 27)");
  console.log("  - Token 2: Standard Entry (0.8 XTZ)");
  console.log("  - Token 3: Premium VIP (2.0 XTZ)");
  console.log("- Event 2: Web3 Gaming Expo (June 30)");
  console.log("  - Token 4: Gamer Pass (0.3 XTZ)");
  console.log("  - Token 5: Pro Gamer VIP (1.0 XTZ)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
