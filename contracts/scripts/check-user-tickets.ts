import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractAt("EventTicketNFTV2", "0x3F82833474353588bC8527CC9faeCD190008100D");

  // Check a few different addresses - add your wallet address here if different
  const addressesToCheck = [
    "0x8285D5AA24E45f38b3C08D5ffc5691e136220E5B", // deployer
    "0x5e1a7dBC58eBd52cAE9b4f5a697c05521aa8676f", // minter
  ];

  // First, let's see all tickets and their actual owners
  console.log("=== All Tickets (by getTicketInfo) ===");
  let ticketCount = 0;
  for (let i = 1; i <= 50; i++) {
    try {
      const info = await contract.getTicketInfo(i);
      console.log(`Ticket ${i}: Event ${info.eventId}, Tier ${info.tierId}, CurrentOwner: ${info.currentOwner}`);
      ticketCount++;
    } catch (e) {
      break;
    }
  }
  console.log(`Total tickets: ${ticketCount}\n`);

  // Now check getUserTicketsForEvent for each address
  for (const addr of addressesToCheck) {
    console.log(`\n=== Tickets for ${addr} (by getUserTicketsForEvent) ===`);
    let found = false;
    for (let eventId = 0; eventId < 11; eventId++) {
      try {
        const tickets = await contract.getUserTicketsForEvent(addr, eventId);
        if (tickets.length > 0) {
          found = true;
          console.log(`Event ${eventId}: ${tickets.length} ticket(s) - IDs: [${tickets.join(", ")}]`);

          // Verify actual ownership
          for (const ticketId of tickets) {
            const info = await contract.getTicketInfo(ticketId);
            const isOwner = info.currentOwner.toLowerCase() === addr.toLowerCase();
            console.log(`  - Ticket ${ticketId}: actualOwner=${info.currentOwner} ${isOwner ? '✓' : '✗ MISMATCH'}`);
          }
        }
      } catch (e) {
        console.log(`Event ${eventId}: Error querying`);
      }
    }
    if (!found) {
      console.log("No tickets found for this address");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
