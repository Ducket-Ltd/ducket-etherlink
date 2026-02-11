import { useState, useCallback } from 'react';

// Fallback price (~$1.20 USD per XTZ) - used for demo
// In production, this would be fetched from a backend proxy to avoid CORS issues
const FALLBACK_XTZ_PRICE = 1.20;

export function useXtzPrice() {
  // For demo purposes, we use a static price to avoid CORS issues with CoinGecko API
  // The CoinGecko public API blocks browser requests (CORS)
  // In production, you would proxy this through your backend
  const [price] = useState<number>(FALLBACK_XTZ_PRICE);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Convert XTZ amount to USD
  const convertXtzToFiat = useCallback((xtzAmount: number): number => {
    return xtzAmount * price;
  }, [price]);

  // Convert USD amount to XTZ
  const convertFiatToXtz = useCallback((fiatAmount: number): number => {
    return fiatAmount / price;
  }, [price]);

  // Format XTZ amount with USD equivalent
  const formatWithFiat = useCallback((xtzAmount: number): { fiat: string; xtz: string } => {
    const fiatValue = convertXtzToFiat(xtzAmount);
    return {
      fiat: `$${fiatValue.toFixed(2)}`,
      xtz: `${xtzAmount.toFixed(2)} XTZ`,
    };
  }, [convertXtzToFiat]);

  return {
    price,
    isLoading,
    error,
    convertXtzToFiat,
    convertFiatToXtz,
    formatWithFiat,
  };
}

// Standalone utility for quick conversion (uses cached price)
export function getXtzPrice(): number {
  return cachedPrice?.usd ?? FALLBACK_XTZ_PRICE;
}
