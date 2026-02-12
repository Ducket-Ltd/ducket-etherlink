import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractAt("EventTicketNFTV2", "0x3F82833474353588bC8527CC9faeCD190008100D");

  console.log("All tickets on contract:");
  for (let i = 1; i <= 30; i++) {
    try {
      const info = await contract.getTicketInfo(i);
      console.log(`Ticket ${i}: Event ${info.eventId}, Tier ${info.tierId}, Owner: ${info.currentOwner}`);
    } catch (e) {
      console.log(`Ticket ${i}: NOT FOUND`);
      break;
    }
  }

  // Get unique owners
  const owners = new Set<string>();
  for (let i = 1; i <= 30; i++) {
    try {
      const info = await contract.getTicketInfo(i);
      owners.add(info.currentOwner.toLowerCase());
    } catch (e) {
      break;
    }
  }

  console.log("\n\nTickets by user per event:");
  for (const addr of owners) {
    console.log(`\n${addr}:`);
    for (let eventId = 0; eventId < 11; eventId++) {
      const tickets = await contract.getUserTicketsForEvent(addr, eventId);
      if (tickets.length > 0) {
        console.log(`  Event ${eventId}: [${tickets.join(", ")}]`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
