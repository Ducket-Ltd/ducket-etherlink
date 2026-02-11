import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Get the correct explorer URL based on chain
const EXPLORER_URL = import.meta.env.VITE_CHAIN_ID === '42793'
  ? 'https://explorer.etherlink.com'
  : 'https://testnet.explorer.etherlink.com';

interface ExplorerLinkProps {
  txHash?: string;
  address?: string;
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function ExplorerLink({
  txHash,
  address,
  className,
  showIcon = true,
  children,
}: ExplorerLinkProps) {
  const url = txHash
    ? `${EXPLORER_URL}/tx/${txHash}`
    : address
    ? `${EXPLORER_URL}/address/${address}`
    : EXPLORER_URL;

  const label = children ?? (txHash ? 'View transaction' : address ? 'View on explorer' : 'Explorer');

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-[#3D2870] hover:text-[#6B5B95] transition-colors',
        className
      )}
    >
      {label}
      {showIcon && <ExternalLink className="h-3.5 w-3.5" />}
    </a>
  );
}

// Get explorer URL for use outside of components
export function getExplorerUrl(type: 'tx' | 'address', hash: string): string {
  return `${EXPLORER_URL}/${type === 'tx' ? 'tx' : 'address'}/${hash}`;
}

// Contract explorer link
export function ContractExplorerLink({ className }: { className?: string }) {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  if (!contractAddress) return null;

  return (
    <ExplorerLink address={contractAddress} className={className}>
      View smart contract
    </ExplorerLink>
  );
}
