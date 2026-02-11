import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-viem";
import * as dotenv from "dotenv";

dotenv.config();

// Helper to normalize private key
function getPrivateKey(): string[] {
  let key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key) return [];

  // Trim whitespace and remove any quotes
  key = key.trim().replace(/['"]/g, '');

  // Remove 0x prefix if present (we'll add it back)
  if (key.startsWith("0x") || key.startsWith("0X")) {
    key = key.slice(2);
  }

  // Validate length (should be 64 hex chars)
  if (key.length !== 64) {
    console.warn(`Warning: Private key has ${key.length} chars, expected 64`);
  }

  return [`0x${key}`];
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // Etherlink Mainnet
    etherlink: {
      url: "https://node.mainnet.etherlink.com",
      accounts: getPrivateKey(),
      chainId: 42793,
    },
    // Etherlink Testnet (Shadownet)
    etherlinkTestnet: {
      url: "https://rpc.ankr.com/etherlink_shadownet_testnet",
      accounts: getPrivateKey(),
      chainId: 127823,
    },
  },
  etherscan: {
    apiKey: {
      etherlink: "no-api-key-needed",
      etherlinkTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "etherlink",
        chainId: 42793,
        urls: {
          apiURL: "https://explorer.etherlink.com/api",
          browserURL: "https://explorer.etherlink.com",
        },
      },
      {
        network: "etherlinkTestnet",
        chainId: 128123,
        urls: {
          apiURL: "https://testnet.explorer.etherlink.com/api",
          browserURL: "https://testnet.explorer.etherlink.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
