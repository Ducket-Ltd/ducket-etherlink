import { http } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { etherlink, etherlinkTestnet } from './chains';

// Contract configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

// Use testnet by default, mainnet if VITE_CHAIN_ID=42793
const isMainnet = import.meta.env.VITE_CHAIN_ID === '42793';
export const ACTIVE_CHAIN = isMainnet ? etherlink : etherlinkTestnet;

export const SUPPORTED_CHAINS = [ACTIVE_CHAIN];

// Wagmi configuration for Etherlink
export const wagmiConfig = getDefaultConfig({
  appName: 'Ducket',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: SUPPORTED_CHAINS as any,
  transports: {
    [etherlink.id]: http('https://node.mainnet.etherlink.com'),
    [etherlinkTestnet.id]: http('https://rpc.ankr.com/etherlink_shadownet_testnet'),
  },
});

// EventTicketNFTV2 ABI for Etherlink
export const CONTRACT_ABI = [
  // Event queries
  {
    inputs: [{ name: 'eventId', type: 'uint256' }],
    name: 'getEvent',
    outputs: [
      {
        components: [
          { name: 'organizer', type: 'address' },
          { name: 'maxResalePercentage', type: 'uint16' },
          { name: 'resaleEnabled', type: 'bool' },
          { name: 'transferEnabled', type: 'bool' },
          { name: 'paused', type: 'bool' },
          { name: 'cancelled', type: 'bool' },
          { name: 'exists', type: 'bool' },
          { name: 'name', type: 'string' },
          { name: 'eventDate', type: 'uint256' },
          { name: 'maxTicketsPerWallet', type: 'uint256' },
          { name: 'totalSupply', type: 'uint256' },
          { name: 'mintedCount', type: 'uint256' },
          { name: 'resaleLockUntil', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Ticket tier queries
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getTicketTier',
    outputs: [
      {
        components: [
          { name: 'eventId', type: 'uint256' },
          { name: 'name', type: 'string' },
          { name: 'seatPrefix', type: 'string' },
          { name: 'price', type: 'uint256' },
          { name: 'maxSupply', type: 'uint256' },
          { name: 'minted', type: 'uint256' },
          { name: 'exists', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Ticket info queries
  {
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    name: 'getTicketInfo',
    outputs: [
      {
        components: [
          { name: 'eventId', type: 'uint256' },
          { name: 'tierId', type: 'uint256' },
          { name: 'seatIdentifier', type: 'string' },
          { name: 'originalPrice', type: 'uint256' },
          { name: 'purchaseTimestamp', type: 'uint256' },
          { name: 'originalPurchaser', type: 'address' },
          { name: 'currentOwner', type: 'address' },
          { name: 'exists', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Public purchase (anyone can call)
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'quantity', type: 'uint256' },
    ],
    name: 'purchaseTicket',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  // Minting (MINTER_ROLE only)
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'quantity', type: 'uint256' },
    ],
    name: 'mintTicket',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  // Demo mode check
  {
    inputs: [],
    name: 'demoMode',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Resale
  {
    inputs: [
      { name: 'ticketId', type: 'uint256' },
      { name: 'price', type: 'uint256' },
    ],
    name: 'listForResale',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    name: 'buyResaleTicket',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    name: 'cancelResaleListing',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'ticketId', type: 'uint256' }],
    name: 'resaleListings',
    outputs: [
      { name: 'ticketId', type: 'uint256' },
      { name: 'seller', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Event tickets query
  {
    inputs: [{ name: 'eventId', type: 'uint256' }],
    name: 'getEventTickets',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  // User queries
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'eventId', type: 'uint256' },
    ],
    name: 'getUserTicketsForEvent',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'eventId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    name: 'getRemainingAllowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // ERC1155
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
