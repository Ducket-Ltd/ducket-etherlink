import { ethers } from "hardhat";

async function main() {
  console.log("Deploying EventTicketNFTV2 contract to Etherlink...");
  console.log("(Demo mode enabled - purchases auto-refund XTZ)");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

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
  console.log("\nDeploying contract...");
  const EventTicketNFTV2 = await ethers.getContractFactory("EventTicketNFTV2");
  const contract = await EventTicketNFTV2.deploy(platformWallet);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("EventTicketNFTV2 deployed to:", contractAddress);
  console.log("Demo mode:", await contract.demoMode() ? "ENABLED" : "DISABLED");

  // Grant MINTER_ROLE to your backend service address if specified
  const backendMinterAddress = process.env.BACKEND_MINTER_ADDRESS;
  if (backendMinterAddress) {
    console.log("\nGranting MINTER_ROLE to backend...");
    const MINTER_ROLE = await contract.MINTER_ROLE();
    const tx = await contract.grantRole(MINTER_ROLE, backendMinterAddress);
    await tx.wait();
    console.log("Granted MINTER_ROLE to backend:", backendMinterAddress);
  }

  const network = await ethers.provider.getNetwork();

  console.log("\n=================================");
  console.log("✅ Deployment complete!");
  console.log("=================================\n");

  console.log("📝 Add these to your .env file:");
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

      if (network.chainId === 42793n) {
        console.log(`🔗 View at: https://explorer.etherlink.com/address/${contractAddress}`);
      } else if (network.chainId === 128123n) {
        console.log(`🔗 View at: https://testnet.explorer.etherlink.com/address/${contractAddress}`);
      }
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.log("⚠️ Verification failed (you can verify manually):", error.message);
      }
    }
  }

  console.log("\n=================================");
  console.log("🎉 Setup Complete!");
  console.log("=================================");
  console.log("\n📋 Next Steps:");
  console.log("1. Update your .env file with the contract address above");
  console.log("2. Fund the minter wallet with XTZ");
  console.log("3. Test the deployment with: npm run dev\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
