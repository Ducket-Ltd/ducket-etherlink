# Deployment Guide

Instructions for deploying the Ducket ticketing platform on Etherlink.

## Prerequisites

- Node.js 18+
- A wallet with XTZ on Etherlink
- Git

## Network Configuration

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Mainnet | 42793 | https://node.mainnet.etherlink.com | https://explorer.etherlink.com |
| Shadownet (Testnet) | 127823 | https://rpc.ankr.com/etherlink_shadownet_testnet | https://shadownet.explorer.etherlink.com |

## Smart Contract Deployment

### 1. Setup

```bash
cd contracts
npm install
cp .env.example .env
```

Edit `.env` and add your deployer private key:

```
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

### 2. Compile Contracts

```bash
npx hardhat compile
```

### 3. Deploy to Testnet (Shadownet)

```bash
npx hardhat run scripts/deploy-v2.ts --network etherlinkShadownet
```

Save the deployed contract address from the output.

### 4. Deploy to Mainnet

```bash
npx hardhat run scripts/deploy-v2.ts --network etherlink
```

### 5. Verify Contract

For Shadownet:
```bash
npx hardhat verify --network etherlinkShadownet <CONTRACT_ADDRESS>
```

For Mainnet:
```bash
npx hardhat verify --network etherlink <CONTRACT_ADDRESS>
```

If the Hardhat verify plugin doesn't work, verify manually via the block explorer:

1. Go to `https://shadownet.explorer.etherlink.com/address/<CONTRACT_ADDRESS>` (testnet) or `https://explorer.etherlink.com/address/<CONTRACT_ADDRESS>` (mainnet)
2. Click "Verify & Publish"
3. Select Solidity compiler version (0.8.20)
4. Paste the flattened source code
5. Submit

### 6. Initialize Events

After deployment, run the setup scripts to create events and ticket tiers:

```bash
# Create demo events
npx hardhat run scripts/setup-demo.ts --network etherlinkShadownet

# Add more events (optional)
npx hardhat run scripts/add-more-events.ts --network etherlinkShadownet
```

## Frontend Deployment

### 1. Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` with your configuration:

```
VITE_CONTRACT_ADDRESS=0x...your_contract_address
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_CHAIN_ID=127823  # Use 42793 for mainnet
```

### 2. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### 4. Deploy to Vercel

The frontend includes a `vercel.json` configuration that handles:
- SPA routing (redirects all routes to index.html)
- Asset caching headers for optimal performance
- Vite framework detection

#### Option A: Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel
```

Follow the prompts. When asked:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time) / Yes (subsequent deploys)
- **What's your project's name?** `ducket-etherlink` (or your choice)
- **In which directory is your code located?** `./` (you're already in frontend/)

#### Option B: Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
6. Add environment variables:
   | Variable | Value |
   |----------|-------|
   | `VITE_CONTRACT_ADDRESS` | `0x3F82833474353588bC8527CC9faeCD190008100D` |
   | `VITE_WALLETCONNECT_PROJECT_ID` | Your WalletConnect project ID |
   | `VITE_CHAIN_ID` | `127823` (testnet) or `42793` (mainnet) |
7. Click "Deploy"

#### Option C: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ducket-ltd/ducket-etherlink&root-directory=frontend&env=VITE_CONTRACT_ADDRESS,VITE_WALLETCONNECT_PROJECT_ID,VITE_CHAIN_ID)

#### Post-Deployment

After deployment, Vercel will provide a URL like `https://ducket-etherlink.vercel.app`. You can:
- Add a custom domain in Project Settings → Domains
- Set up preview deployments for pull requests (enabled by default)
- Configure production branch (defaults to `main`)

## Connect MetaMask to Etherlink

### Automatic (Recommended)

The app will prompt users to add the network when they try to connect. Click "Add Network" in MetaMask when prompted.

### Manual Configuration

#### Etherlink Mainnet

| Field | Value |
|-------|-------|
| Network Name | Etherlink |
| RPC URL | https://node.mainnet.etherlink.com |
| Chain ID | 42793 |
| Currency Symbol | XTZ |
| Block Explorer | https://explorer.etherlink.com |

#### Etherlink Shadownet (Testnet)

| Field | Value |
|-------|-------|
| Network Name | Etherlink Shadownet |
| RPC URL | https://rpc.ankr.com/etherlink_shadownet_testnet |
| Chain ID | 127823 |
| Currency Symbol | XTZ |
| Block Explorer | https://shadownet.explorer.etherlink.com |

## Getting XTZ on Etherlink

### Testnet (Shadownet)

1. Get Tezos testnet XTZ from a faucet (e.g., https://faucet.ghostnet.teztnets.com/)
2. Bridge to Etherlink Shadownet using the [Etherlink Bridge](https://bridge.etherlink.com)

### Mainnet

1. Purchase XTZ on an exchange (Binance, Kraken, Coinbase, etc.)
2. Bridge to Etherlink Mainnet using the [Etherlink Bridge](https://bridge.etherlink.com)

## Environment Variables Reference

### Contracts (`contracts/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DEPLOYER_PRIVATE_KEY` | Private key for deployment wallet | Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CONTRACT_ADDRESS` | Deployed contract address | Yes |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID | Yes |
| `VITE_CHAIN_ID` | Target chain (127823 for testnet, 42793 for mainnet) | No (defaults to testnet) |

## Troubleshooting

### Contract Deployment Fails

- Ensure your wallet has enough XTZ for gas
- Check the RPC URL is correct for your target network
- Verify your private key is correctly formatted (no `0x` prefix needed)

### Frontend Can't Connect to Contract

- Verify `VITE_CONTRACT_ADDRESS` matches the deployed address
- Ensure you're on the correct network in MetaMask
- Check browser console for errors

### Transactions Failing

- Check you have enough XTZ for gas
- Verify the contract function parameters
- Look at the transaction on the block explorer for revert reasons

### MetaMask Not Recognizing Network

- Clear MetaMask cache and re-add the network
- Ensure the chain ID matches exactly (127823 for testnet, 42793 for mainnet)
- Try disconnecting and reconnecting your wallet
