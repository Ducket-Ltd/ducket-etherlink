import { ethers } from "hardhat";

async function main() {
  console.log("=".repeat(60));
  console.log("Deploying EventTicketNFTV2 contract to Etherlink...");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("\nDeploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "XTZ");

  if (balance === 0n) {
    console.error("\n❌ Error: Deployer wallet has no XTZ!");
    console.log("Get test XTZ from the Etherlink faucet");
    console.log("Wallet address:", deployer.address);
    process.exit(1);
  }

  // Platform wallet - in production this should be a multisig or DAO treasury
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  console.log("Platform wallet:", platformWallet);

  // Deploy contract
  console.log("\n" + "=".repeat(60));
  console.log("Deploying contract...");
  console.log("=".repeat(60));

  const EventTicketNFTV2 = await ethers.getContractFactory("EventTicketNFTV2");
  const contract = await EventTicketNFTV2.deploy(platformWallet);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ EventTicketNFTV2 deployed to:", contractAddress);

  // Grant MINTER_ROLE to your backend service address if specified
  const backendMinterAddress = process.env.BACKEND_MINTER_ADDRESS;
  if (backendMinterAddress) {
    console.log("\nGranting MINTER_ROLE to backend service...");
    const MINTER_ROLE = await contract.MINTER_ROLE();
    const tx = await contract.grantRole(MINTER_ROLE, backendMinterAddress);
    await tx.wait();
    console.log("✅ Granted MINTER_ROLE to:", backendMinterAddress);
  }

  const network = await ethers.provider.getNetwork();

  // Log contract info
  console.log("\n" + "=".repeat(60));
  console.log("Contract Configuration");
  console.log("=".repeat(60));

  const platformFeePrimary = await contract.platformFeePrimary();
  const platformFeeResale = await contract.platformFeeResale();
  const maxEventSupply = await contract.maxEventSupply();
  const maxTicketsPerTx = await contract.maxTicketsPerTransaction();

  console.log(`Platform Fee (Primary): ${Number(platformFeePrimary) / 100}%`);
  console.log(`Platform Fee (Resale):  ${Number(platformFeeResale) / 100}%`);
  console.log(`Max Tickets Per Event:  ${maxEventSupply}`);
  console.log(`Max Tickets Per Tx:     ${maxTicketsPerTx}`);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Deployment Complete!");
  console.log("=".repeat(60));

  console.log("\n📝 Add these to your .env file:");
  console.log("─".repeat(40));
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_CHAIN_ID=${network.chainId}`);

  // Verify contract on block explorer (if not local network)
  if (network.chainId !== 1337n && network.chainId !== 31337n) {
    console.log("\n⏳ Waiting 30 seconds for block confirmations...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    console.log("🔍 Verifying contract on Etherlink Explorer...");
    try {
      const hre = await import("hardhat");
      await hre.default.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [platformWallet],
      });
      console.log("✅ Contract verified!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log("⚠️ Verification failed (you can verify manually):", error.message);
      }
    }

    if (network.chainId === 42793n) {
      console.log(`🔗 View at: https://explorer.etherlink.com/address/${contractAddress}`);
    } else if (network.chainId === 128123n) {
      console.log(`🔗 View at: https://testnet.explorer.etherlink.com/address/${contractAddress}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Setup Complete!");
  console.log("=".repeat(60));

  console.log("\n📋 Next Steps:");
  console.log("1. Update your .env file with the contract address above");
  console.log("2. Update frontend config with new ABI");
  console.log("3. Test the deployment with: npm run dev\n");

  // Return the contract address for use in seed script
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
