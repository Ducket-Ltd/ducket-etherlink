import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x3F82833474353588bC8527CC9faeCD190008100D";

  console.log("Adding more events to contract:", contractAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "XTZ\n");

  const contract = await ethers.getContractAt("EventTicketNFTV2", contractAddress);

  // Event dates in 2026
  const may15_2026 = Math.floor(new Date("2026-05-15T19:00:00+08:00").getTime() / 1000);
  const may28_2026 = Math.floor(new Date("2026-05-28T10:00:00+08:00").getTime() / 1000);
  const july10_2026 = Math.floor(new Date("2026-07-10T20:00:00+08:00").getTime() / 1000);
  const july25_2026 = Math.floor(new Date("2026-07-25T14:00:00+08:00").getTime() / 1000);
  const aug8_2026 = Math.floor(new Date("2026-08-08T18:00:00+08:00").getTime() / 1000);
  const aug22_2026 = Math.floor(new Date("2026-08-22T09:00:00+08:00").getTime() / 1000);
  const sept5_2026 = Math.floor(new Date("2026-09-05T19:30:00+08:00").getTime() / 1000);
  const sept19_2026 = Math.floor(new Date("2026-09-19T10:00:00+08:00").getTime() / 1000);

  // Event 4: Art Exhibition (May 15)
  console.log("Creating Event 4: Digital Art Gallery Opening...");
  let tx = await contract.createEvent(
    "Digital Art Gallery Opening",
    may15_2026,
    130,  // 130% max resale
    2,    // max 2 per wallet
    200,
    true,
    true
  );
  await tx.wait();
  console.log("✅ Event 4 created (eventId: 3)");

  tx = await contract.createTicketTier(3, "Gallery Entry", "ART", ethers.parseEther("0.25"), 150);
  await tx.wait();
  console.log("  ✅ Token 6: Gallery Entry @ 0.25 XTZ");

  tx = await contract.createTicketTier(3, "Collector's Preview", "COL", ethers.parseEther("0.75"), 50);
  await tx.wait();
  console.log("  ✅ Token 7: Collector's Preview @ 0.75 XTZ");

  // Event 5: Startup Summit (May 28)
  console.log("\nCreating Event 5: APAC Startup Summit...");
  tx = await contract.createEvent(
    "APAC Startup Summit",
    may28_2026,
    115,
    4,
    600,
    true,
    true
  );
  await tx.wait();
  console.log("✅ Event 5 created (eventId: 4)");

  tx = await contract.createTicketTier(4, "Attendee Pass", "ATT", ethers.parseEther("0.4"), 400);
  await tx.wait();
  console.log("  ✅ Token 8: Attendee Pass @ 0.4 XTZ");

  tx = await contract.createTicketTier(4, "Investor Circle", "INV", ethers.parseEther("1.5"), 100);
  await tx.wait();
  console.log("  ✅ Token 9: Investor Circle @ 1.5 XTZ");

  tx = await contract.createTicketTier(4, "Founder's Table", "FND", ethers.parseEther("3.0"), 50);
  await tx.wait();
  console.log("  ✅ Token 10: Founder's Table @ 3.0 XTZ");

  // Event 6: Comedy Night (July 10)
  console.log("\nCreating Event 6: Stand-Up Comedy Night...");
  tx = await contract.createEvent(
    "Stand-Up Comedy Night",
    july10_2026,
    110,
    6,
    300,
    true,
    true
  );
  await tx.wait();
  console.log("✅ Event 6 created (eventId: 5)");

  tx = await contract.createTicketTier(5, "General Seating", "GEN", ethers.parseEther("0.2"), 200);
  await tx.wait();
  console.log("  ✅ Token 11: General Seating @ 0.2 XTZ");

  tx = await contract.createTicketTier(5, "Front Row", "FRT", ethers.parseEther("0.5"), 50);
  await tx.wait();
  console.log("  ✅ Token 12: Front Row @ 0.5 XTZ");

  // Event 7: Food Festival (July 25)
  console.log("\nCreating Event 7: Street Food Festival...");
  tx = await contract.createEvent(
    "Street Food Festival",
    july25_2026,
    100,  // No markup allowed
    8,
    2000,
    true,
    true
  );
  await tx.wait();
  console.log("✅ Event 7 created (eventId: 6)");

  tx = await contract.createTicketTier(6, "Day Pass", "DAY", ethers.parseEther("0.15"), 1500);
  await tx.wait();
  console.log("  ✅ Token 13: Day Pass @ 0.15 XTZ");

  tx = await contract.createTicketTier(6, "VIP Tasting", "VIP", ethers.parseEther("0.6"), 300);
  await tx.wait();
  console.log("  ✅ Token 14: VIP Tasting @ 0.6 XTZ");

  // Event 8: Esports Tournament (Aug 8)
  console.log("\nCreating Event 8: APAC Esports Championship...");
  tx = await contract.createEvent(
    "APAC Esports Championship",
    aug8_2026,
    150,
    4,
    800,
    true,
    false  // Non-transferable
  );
  await tx.wait();
  console.log("✅ Event 8 created (eventId: 7)");

  tx = await contract.createTicketTier(7, "Spectator", "SPEC", ethers.parseEther("0.35"), 600);
  await tx.wait();
  console.log("  ✅ Token 15: Spectator @ 0.35 XTZ");

  tx = await contract.createTicketTier(7, "Arena VIP", "AVIP", ethers.parseEther("1.0"), 150);
  await tx.wait();
  console.log("  ✅ Token 16: Arena VIP @ 1.0 XTZ");

  // Event 9: Wellness Retreat (Aug 22)
  console.log("\nCreating Event 9: Mindful Tech Retreat...");
  tx = await contract.createEvent(
    "Mindful Tech Retreat",
    aug22_2026,
    100,
    2,
    100,
    false,  // No resale
    false   // Non-transferable
  );
  await tx.wait();
  console.log("✅ Event 9 created (eventId: 8)");

  tx = await contract.createTicketTier(8, "Full Day Experience", "ZEN", ethers.parseEther("1.2"), 80);
  await tx.wait();
  console.log("  ✅ Token 17: Full Day Experience @ 1.2 XTZ");

  // Event 10: Film Premiere (Sept 5)
  console.log("\nCreating Event 10: Crypto Documentary Premiere...");
  tx = await contract.createEvent(
    "Crypto Documentary Premiere",
    sept5_2026,
    140,
    4,
    400,
    true,
    true
  );
  await tx.wait();
  console.log("✅ Event 10 created (eventId: 9)");

  tx = await contract.createTicketTier(9, "Standard Screening", "SCR", ethers.parseEther("0.3"), 300);
  await tx.wait();
  console.log("  ✅ Token 18: Standard Screening @ 0.3 XTZ");

  tx = await contract.createTicketTier(9, "Red Carpet", "RED", ethers.parseEther("0.9"), 100);
  await tx.wait();
  console.log("  ✅ Token 19: Red Carpet @ 0.9 XTZ");

  // Event 11: Developer Conference (Sept 19)
  console.log("\nCreating Event 11: Etherlink DevCon...");
  tx = await contract.createEvent(
    "Etherlink DevCon 2026",
    sept19_2026,
    120,
    4,
    500,
    true,
    true
  );
  await tx.wait();
  console.log("✅ Event 11 created (eventId: 10)");

  tx = await contract.createTicketTier(10, "Developer Pass", "DEV", ethers.parseEther("0.5"), 350);
  await tx.wait();
  console.log("  ✅ Token 20: Developer Pass @ 0.5 XTZ");

  tx = await contract.createTicketTier(10, "Workshop Bundle", "WRK", ethers.parseEther("1.0"), 100);
  await tx.wait();
  console.log("  ✅ Token 21: Workshop Bundle @ 1.0 XTZ");

  console.log("\n=================================");
  console.log("✅ All events created!");
  console.log("=================================\n");
  console.log("New Events Added:");
  console.log("- Event 3: Digital Art Gallery Opening (May 15) - Tokens 6-7");
  console.log("- Event 4: APAC Startup Summit (May 28) - Tokens 8-10");
  console.log("- Event 5: Stand-Up Comedy Night (July 10) - Tokens 11-12");
  console.log("- Event 6: Street Food Festival (July 25) - Tokens 13-14");
  console.log("- Event 7: APAC Esports Championship (Aug 8) - Tokens 15-16");
  console.log("- Event 8: Mindful Tech Retreat (Aug 22) - Token 17");
  console.log("- Event 9: Crypto Documentary Premiere (Sept 5) - Tokens 18-19");
  console.log("- Event 10: Etherlink DevCon 2026 (Sept 19) - Tokens 20-21");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
