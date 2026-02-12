import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x3F82833474353588bC8527CC9faeCD190008100D";

  console.log("Listing tickets for resale on contract:", contractAddress);

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const contract = await ethers.getContractAt("EventTicketNFTV2", contractAddress);

  // Tickets minted in previous script: 5, 6, 7, 8, 9
  // Let's list tickets 5, 6, 7 for resale

  const ticketsToList = [
    { ticketId: 5, price: ethers.parseEther("0.65") },  // GA ticket, 130% of 0.5
    { ticketId: 6, price: ethers.parseEther("0.4") },   // Gamer Pass, ~133% of 0.3
    { ticketId: 7, price: ethers.parseEther("0.45") },  // Attendee Pass, ~112% of 0.4
  ];

  console.log("\n=== Listing tickets for resale ===\n");

  for (const { ticketId, price } of ticketsToList) {
    try {
      console.log(`Listing ticket #${ticketId} for ${ethers.formatEther(price)} XTZ...`);
      const tx = await contract.listForResale(ticketId, price);
      await tx.wait();
      console.log(`  ✅ Listed successfully`);
    } catch (error: any) {
      console.log(`  ⚠️ Failed: ${error.message?.slice(0, 100)}`);
    }
  }

  console.log("\n=================================");
  console.log("✅ Resale listings complete!");
  console.log("=================================\n");

  // Verify listings
  console.log("Verifying listings...\n");
  for (const { ticketId } of ticketsToList) {
    const listing = await contract.resaleListings(ticketId);
    console.log(`Ticket #${ticketId}:`);
    console.log(`  Active: ${listing[3]}`);  // listing.active is 4th element
    console.log(`  Price: ${ethers.formatEther(listing[2])} XTZ`);  // listing.price is 3rd element
    console.log(`  Seller: ${listing[1]}`);  // listing.seller is 2nd element
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
