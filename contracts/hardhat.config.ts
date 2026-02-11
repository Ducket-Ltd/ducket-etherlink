import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-viem";
import * as dotenv from "dotenv";

dotenv.config();

// Helper to ensure private key has 0x prefix
function getPrivateKey(): string[] {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key) return [];
  return [key.startsWith("0x") ? key : `0x${key}`];
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
    // Etherlink Testnet (Ghostnet)
    etherlinkTestnet: {
      url: "https://node.ghostnet.etherlink.com",
      accounts: getPrivateKey(),
      chainId: 128123,
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
