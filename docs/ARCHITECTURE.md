# Ducket Architecture

High-level system architecture for the Ducket ticketing platform on Etherlink.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                     (React + Vite + TypeScript)                         │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │    Home     │  │   Event     │  │ My Tickets  │  │   Resale    │   │
│  │   (Browse)  │  │   Detail    │  │  (Wallet)   │  │ Marketplace │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                              │                                          │
│                              ▼                                          │
│                    ┌─────────────────┐                                  │
│                    │  wagmi + viem   │                                  │
│                    │  (Web3 Client)  │                                  │
│                    └────────┬────────┘                                  │
└─────────────────────────────┼───────────────────────────────────────────┘
                              │
                              │ JSON-RPC
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ETHERLINK L2                                    │
│                    (EVM-Compatible Blockchain)                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    EventTicketNFTV2.sol                          │   │
│  │                      (ERC-1155 NFT)                              │   │
│  │                                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │   │
│  │  │    Events    │  │   Tickets    │  │   Resale Listings    │   │   │
│  │  │  - Metadata  │  │  - Ownership │  │   - Price Caps       │   │   │
│  │  │  - Tiers     │  │  - Transfers │  │   - Active Listings  │   │   │
│  │  │  - Pricing   │  │  - History   │  │   - Purchases        │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Chain ID: 127823 (Shadownet Testnet) / 42793 (Mainnet)                │
│  Native Currency: XTZ                                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Smart Contract Layer

### EventTicketNFTV2 (Solidity)

The core smart contract deployed on Etherlink, implementing ERC-1155 for multi-token ticket management.

**Key Features:**

| Feature | Description |
|---------|-------------|
| Event Management | Organizers create events with configurable rules, pricing, and supply |
| Ticket Tiers | Multiple price tiers per event (GA, VIP, etc.) with separate supplies |
| Public Purchase | Direct on-chain ticket purchase — no intermediaries |
| Resale Marketplace | Peer-to-peer resale with protocol-enforced price caps |
| Demo Mode | Auto-refund for frictionless evaluation (XTZ returned, NFT retained) |

**On-Chain Enforcement:**

```
┌─────────────────────────────────────────────────────────┐
│                  PRICE CAP ENFORCEMENT                   │
│                                                         │
│  Original Price: $50 (0.5 XTZ)                          │
│  Resale Cap: 150%                                       │
│  Maximum Resale: $75 (0.75 XTZ)                         │
│                                                         │
│  ✓ List at $60 → Transaction succeeds                  │
│  ✓ List at $75 → Transaction succeeds                  │
│  ✗ List at $80 → Transaction REVERTS                   │
│                                                         │
│  Enforced at contract level — cannot be bypassed        │
└─────────────────────────────────────────────────────────┘
```

### Demo Mode vs Production Mode

| Aspect | Demo Mode (Current) | Production Mode |
|--------|---------------------|-----------------|
| Purchase | XTZ auto-refunded to buyer | XTZ held in escrow |
| Resale | XTZ auto-refunded to buyer | Seller receives payment |
| NFT | Minted and retained by buyer | Minted and retained by buyer |
| Purpose | Frictionless evaluation | Real transactions |

In production, funds would be held in escrow until post-event settlement, enabling refunds for cancelled events and organizer payouts.

## Frontend Layer

### Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Web3**: wagmi v2 + viem
- **Wallet**: RainbowKit

### Data Flow

```
User Action          Frontend              Contract              Blockchain
    │                   │                     │                      │
    │  Click "Buy"      │                     │                      │
    ├──────────────────►│                     │                      │
    │                   │  purchaseTicket()   │                      │
    │                   ├────────────────────►│                      │
    │                   │                     │   Execute + Mine     │
    │                   │                     ├─────────────────────►│
    │                   │                     │                      │
    │                   │                     │   Tx Receipt         │
    │                   │                     │◄─────────────────────┤
    │                   │   Confirmation      │                      │
    │                   │◄────────────────────┤                      │
    │  Success Toast    │                     │                      │
    │◄──────────────────┤                     │                      │
```

### Key Pages

| Page | Purpose | Contract Interaction |
|------|---------|---------------------|
| Home | Event discovery | Read: Event metadata |
| Event Detail | Purchase tickets | Write: `purchaseTicket()` |
| My Tickets | View owned NFTs | Read: `getUserTicketsForEvent()` |
| Resale | Browse listings | Read: `resaleListings()`, Write: `buyResaleTicket()` |
| How It Works | Technical explainer | Read: Contract address for explorer link |

## Security Model

### Non-Custodial Ownership

- Tickets are NFTs held directly in user wallets
- Platform never takes custody of user assets
- Transfers require wallet signature (MetaMask, etc.)

### On-Chain Enforcement

- Resale price caps enforced by smart contract `require()` statements
- Per-wallet purchase limits prevent bulk buying
- Time-locked resale prevents immediate speculation

### Trust Assumptions

| Component | Trust Model |
|-----------|-------------|
| Smart Contract | Trustless — code is law, verified on-chain |
| Etherlink | Trust Etherlink validators for consensus |
| Frontend | Trustless — read-only from chain, writes require signature |
| Price Feed | Trust CoinGecko API (fallback to hardcoded rate) |

## Etherlink Integration

### Why Etherlink?

| Feature | Benefit for Ticketing |
|---------|----------------------|
| Sub-second finality | Instant purchase confirmation |
| Sub-cent fees | Micro-transactions viable (~$0.001 per tx) |
| MEV protection | Bots can't front-run ticket purchases |
| EVM compatibility | Standard Solidity tooling, MetaMask support |
| Tezos security | Inherits decentralization from Tezos L1 |

### Network Configuration

```typescript
// Etherlink Mainnet
{
  id: 42793,
  name: 'Etherlink',
  rpcUrl: 'https://node.mainnet.etherlink.com',
  explorer: 'https://explorer.etherlink.com',
  nativeCurrency: { name: 'XTZ', symbol: 'XTZ', decimals: 18 }
}

// Etherlink Shadownet (Testnet)
{
  id: 127823,
  name: 'Etherlink Shadownet',
  rpcUrl: 'https://rpc.ankr.com/etherlink_shadownet_testnet',
  explorer: 'https://shadownet.explorer.etherlink.com',
  nativeCurrency: { name: 'XTZ', symbol: 'XTZ', decimals: 18 }
}
```

## Future Considerations

This demo architecture is intentionally simplified for evaluation. A production deployment would include:

- **Backend Services**: Event management, user accounts, analytics
- **Payment Processing**: Fiat on-ramps, multi-currency support
- **Escrow System**: Funds held until post-event settlement
- **QR Validation**: Ticket scanning and redemption at venues
- **Organizer Dashboard**: Event creation, ticket management, payouts

These components are not included in this demo to focus on the core blockchain integration and anti-scalping value proposition.
