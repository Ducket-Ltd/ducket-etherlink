# Ducket on Etherlink

**Fair Ticketing for Everyone**

No scalpers. No hidden fees. No stress.

## The Vision

Ducket is reimagining ticketing — making it fair, transparent, and secure for everyone. Built on Etherlink, an EVM-compatible Layer 2 in the Tezos ecosystem, this platform demonstrates how smart contracts can solve the broken ticketing industry.

### The Problem

Ticket scalping ruins live events. Fans pay inflated prices while bots and resellers profit. Traditional ticketing platforms rely on policies that are easily circumvented — they can't actually prevent scalping.

### The Solution

Every Ducket ticket is an NFT with smart contract-enforced resale caps. The code itself prevents unfair pricing — scalping becomes mathematically impossible, not just against the rules.

## Features

- **Verified Tickets**: Every ticket is an ERC-1155 NFT — cryptographically verified, impossible to counterfeit
- **Transparent Pricing**: What you see is what you pay. No hidden fees, no surprises
- **Price-Capped Resale**: Resale limits enforced by smart contracts, not policies. Scalping is mathematically impossible
- **Non-Custodial**: Your tickets live in your wallet. Only you control them — we never hold your assets
- **Instant Finality**: Sub-second confirmations mean your purchase is final the moment you click
- **Negligible Fees**: Transaction costs under $0.001 — fees never exceed the ticket value

## Project Structure

```
ducket-etherlink/
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/          # Solidity files
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts   # Configured for Etherlink
│
├── frontend/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── config/         # Chain & wagmi config
│   │   ├── hooks/          # React hooks (useXtzPrice, etc.)
│   │   ├── lib/            # Utilities & mock data
│   │   └── pages/          # Page components
│   └── package.json
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # System architecture
│   └── DEPLOYMENT.md       # Deployment guide
│
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- A wallet with XTZ on Etherlink testnet

### Deploy Contracts

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your private key

# Deploy to Etherlink testnet
npm run deploy:v2
```

### Run Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your contract address and WalletConnect project ID

npm run dev
```

## Etherlink Network Details

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Mainnet | 42793 | https://node.mainnet.etherlink.com | https://explorer.etherlink.com |
| Shadownet (Testnet) | 127823 | https://rpc.ankr.com/etherlink_shadownet_testnet | https://shadownet.explorer.etherlink.com |

Native currency: **XTZ** (18 decimals)

## Deployed Contracts

| Network | Contract | Address |
|---------|----------|---------|
| Shadownet | EventTicketNFTV2 | `0x3F82833474353588bC8527CC9faeCD190008100D` |

## How It Works

1. **Find an Event** — Browse upcoming concerts, festivals, and experiences
2. **Purchase Tickets** — Connect your wallet and buy tickets directly on-chain
3. **Get Your Tickets** — NFT tickets are instantly minted to your wallet
4. **Resell Fairly** — List tickets on the built-in marketplace at fair, capped prices

### Demo Mode

This demo includes an auto-refund feature — your XTZ is returned after purchase while you keep the NFT ticket. This lets you experience the full flow without spending real funds.

## Smart Contract Architecture

### EventTicketNFTV2

The core smart contract that powers fair ticketing:

- **Event Management**: Organizers create events with configurable rules and resale caps
- **Ticket Tiers**: Multiple price tiers per event (General Admission, VIP, etc.)
- **Public Purchase**: Anyone can buy tickets directly — no intermediaries
- **Resale Marketplace**: Built-in peer-to-peer marketplace with enforced price caps
- **Transfer Controls**: Organizers can enable/disable ticket transfers per event

Key functions:
- `purchaseTicket()` - Buy tickets directly (public)
- `listForResale()` - List your ticket on the marketplace
- `buyResaleTicket()` - Purchase from another fan at a fair price
- `cancelResaleListing()` - Remove your listing

## Why Etherlink?

Etherlink is an EVM-compatible Layer 2 that brings Ethereum-grade smart contracts to the Tezos ecosystem.

- **Sub-second finality** — Transactions confirm instantly, no waiting for your tickets
- **Sub-cent fees** — Gas costs under $0.001, making microtransactions viable
- **EVM & Solidity** — Write contracts in Solidity, use MetaMask, leverage Ethereum tooling
- **MEV protection** — Fair transaction ordering prevents bots from front-running fans
- **Tezos security** — Inherits the security and decentralization of the Tezos network

## Tech Stack

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Frontend**: React, Vite, TypeScript
- **Blockchain**: wagmi v2, viem, RainbowKit
- **Styling**: Tailwind CSS, shadcn/ui

## Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md) — System design and technical details
- [Deployment Guide](./docs/DEPLOYMENT.md) — How to deploy contracts and frontend
- [Audit Report](./docs/AUDIT_REPORT.md) — Security and IP audit results

## Team

Built by the Ducket team — reimagining ticketing for the Web3 era.

## License

MIT

---

[View Demo](https://ducket-etherlink.vercel.app) · [View Contract on Explorer](https://shadownet.explorer.etherlink.com/address/0x3F82833474353588bC8527CC9faeCD190008100D)
