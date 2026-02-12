import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x3F82833474353588bC8527CC9faeCD190008100D";

  console.log("Setting up resale demo tickets on contract:", contractAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "XTZ\n");

  const contract = await ethers.getContractAt("EventTicketNFTV2", contractAddress);

  // We'll mint tickets to the deployer wallet, then list some for resale
  // This simulates users who have purchased tickets and want to resell them

  console.log("=== Minting tickets for resale demo ===\n");

  // Mint tickets for different events with different tiers
  const ticketsToMint = [
    { tokenId: 0, name: "Singapore Tech Conference - GA", price: "0.5" },
    { tokenId: 1, name: "Singapore Tech Conference - VIP", price: "1.2" },
    { tokenId: 2, name: "Blockchain Music Festival - Standard", price: "0.8" },
    { tokenId: 3, name: "Blockchain Music Festival - Premium VIP", price: "2.0" },
    { tokenId: 4, name: "Web3 Gaming Expo - Gamer Pass", price: "0.3" },
    { tokenId: 8, name: "APAC Startup Summit - Attendee", price: "0.4" },
    { tokenId: 11, name: "Comedy Night - General", price: "0.2" },
    { tokenId: 18, name: "Crypto Documentary - Standard", price: "0.3" },
  ];

  const mintedTicketIds: bigint[] = [];

  for (const ticket of ticketsToMint) {
    try {
      console.log(`Minting ${ticket.name}...`);
      const price = ethers.parseEther(ticket.price);

      // Use mintTicket with MINTER_ROLE (deployer has this role)
      const tx = await contract.mintTicket(
        ticket.tokenId,
        deployer.address,
        1, // quantity
        { value: price }
      );
      const receipt = await tx.wait();

      // Get the minted ticket ID from the event
      const mintEvent = receipt?.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log as any);
          return parsed?.name === "TicketMinted";
        } catch {
          return false;
        }
      });

      if (mintEvent) {
        const parsed = contract.interface.parseLog(mintEvent as any);
        const ticketId = parsed?.args?.ticketId;
        mintedTicketIds.push(ticketId);
        console.log(`  ✅ Minted ticket #${ticketId}`);
      }
    } catch (error: any) {
      console.log(`  ⚠️ Failed to mint: ${error.message?.slice(0, 50)}`);
    }
  }

  console.log(`\n=== Listing tickets for resale ===\n`);

  // List about half of the tickets for resale
  const ticketsToList = mintedTicketIds.slice(0, Math.ceil(mintedTicketIds.length / 2));

  for (const ticketId of ticketsToList) {
    try {
      // Get ticket info to determine price cap
      const ticketInfo = await contract.getTicketInfo(ticketId);
      const tierInfo = await contract.getTicketTier(ticketInfo.tierId);
      const eventInfo = await contract.getEvent(ticketInfo.eventId);

      // Calculate a resale price (random between 100-maxResalePercentage)
      const originalPrice = ticketInfo.originalPrice;
      const maxPercentage = Number(eventInfo.maxResalePercentage);
      const randomPercentage = 100 + Math.floor(Math.random() * (maxPercentage - 100));
      const resalePrice = (originalPrice * BigInt(randomPercentage)) / 100n;

      console.log(`Listing ticket #${ticketId} (${tierInfo.name}) for ${ethers.formatEther(resalePrice)} XTZ (${randomPercentage}% of original)...`);

      const tx = await contract.listForResale(ticketId, resalePrice);
      await tx.wait();
      console.log(`  ✅ Listed successfully`);
    } catch (error: any) {
      console.log(`  ⚠️ Failed to list: ${error.message?.slice(0, 80)}`);
    }
  }

  console.log("\n=================================");
  console.log("✅ Resale demo setup complete!");
  console.log("=================================\n");

  console.log("Minted tickets:", mintedTicketIds.map(id => id.toString()).join(", "));
  console.log("Listed for resale:", ticketsToList.map(id => id.toString()).join(", "));

  // Query and display active resale listings
  console.log("\n=== Active Resale Listings ===\n");
  for (const ticketId of ticketsToList) {
    try {
      const listing = await contract.resaleListings(ticketId);
      if (listing.active) {
        const ticketInfo = await contract.getTicketInfo(ticketId);
        const tierInfo = await contract.getTicketTier(ticketInfo.tierId);
        console.log(`Ticket #${ticketId}: ${tierInfo.name} @ ${ethers.formatEther(listing.price)} XTZ`);
      }
    } catch (error) {
      // Skip
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
