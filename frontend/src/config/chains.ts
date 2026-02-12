import { defineChain } from 'viem';

// Etherlink Mainnet
export const etherlink = defineChain({
  id: 42793,
  name: 'Etherlink',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://node.mainnet.etherlink.com'] },
  },
  blockExplorers: {
    default: { name: 'Etherlink Explorer', url: 'https://explorer.etherlink.com' },
  },
});

// Etherlink Testnet (Shadownet)
export const etherlinkTestnet = defineChain({
  id: 127823,
  name: 'Etherlink Shadownet',
  nativeCurrency: {
    name: 'XTZ',
    symbol: 'XTZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://node.shadownet.etherlink.com',
        'https://rpc.ankr.com/etherlink_shadownet_testnet',
      ]
    },
  },
  blockExplorers: {
    default: { name: 'Etherlink Shadownet Explorer', url: 'https://shadownet.explorer.etherlink.com' },
  },
  testnet: true,
});
