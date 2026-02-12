import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x3F82833474353588bC8527CC9faeCD190008100D";
  const baseURI = "https://ducket-etherlink.vercel.app/metadata/";

  console.log("Setting baseURI on contract:", contractAddress);
  console.log("New baseURI:", baseURI);

  const contract = await ethers.getContractAt("EventTicketNFTV2", contractAddress);

  // Set the base URI
  const tx = await contract.setURI(baseURI);
  await tx.wait();

  console.log("\n✅ baseURI set successfully!");

  // Verify
  console.log("\nVerifying...");
  console.log("Token name:", await contract.name());
  console.log("Token symbol:", await contract.symbol());
  console.log("Base URI:", await contract.baseURI());

  // Check a sample token URI
  const tokenURI = await contract.uri(0);
  console.log("Token 0 URI:", tokenURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
