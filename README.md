# Ducket on Etherlink

NFT Ticketing Platform built on Etherlink - demonstrating secure, anti-scalping event tickets with price-capped resale.

## Overview

Ducket is a blockchain-based ticketing platform that solves the ticket scalping problem using NFTs with enforced resale price caps. This demo version is built specifically for the Etherlink blockchain.

### Features

- **NFT Tickets**: Each ticket is a unique ERC-1155 token on Etherlink
- **Anti-Scalping**: Organizers set maximum resale prices (e.g., 110% of original)
- **Fair Resale**: Built-in marketplace with enforced price caps
- **Instant Transfers**: Fast finality on Etherlink means instant ticket transfers
- **Low Fees**: Etherlink's efficient L2 keeps transaction costs minimal

## Project Structure

```
ducket-etherlink/
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/          # Solidity files
│   │   ├── EventTicketNFT.sol
│   │   └── EventTicketNFTV2.sol
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── hardhat.config.ts   # Configured for Etherlink
│
├── frontend/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── config/         # Chain & wagmi config
│   │   ├── lib/            # Utilities & mock data
│   │   └── pages/          # Page components
│   └── package.json
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
| Testnet | 128123 | https://node.ghostnet.etherlink.com | https://testnet.explorer.etherlink.com |

Native currency: **XTZ** (18 decimals)

## Smart Contract Architecture

### EventTicketNFTV2

The main contract implements:

- **Event Management**: Organizers create events with configurable rules
- **Ticket Tiers**: Multiple price tiers per event (GA, VIP, etc.)
- **Minting**: Platform mints tickets on behalf of buyers
- **Resale Marketplace**: Built-in listing and purchasing with price caps
- **Access Control**: Role-based permissions (ADMIN, MINTER)

Key functions:
- `createEvent()` - Create new event with rules
- `createTicketTier()` - Add ticket tier to event
- `mintTicket()` - Mint tickets (requires MINTER_ROLE)
- `listForResale()` - List ticket on marketplace
- `buyResaleTicket()` - Purchase from marketplace

## License

MIT

---

Built for the Etherlink Hackathon by Fortify Labs
