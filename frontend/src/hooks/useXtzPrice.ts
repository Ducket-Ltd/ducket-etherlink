import { useState, useEffect, useCallback } from 'react';

interface XtzPriceData {
  usd: number;
  lastUpdated: number;
}

// Fallback price if API fails (~$1.20 USD per XTZ)
const FALLBACK_XTZ_PRICE = 1.20;
const CACHE_DURATION = 60 * 1000; // 60 seconds

let cachedPrice: XtzPriceData | null = null;

export function useXtzPrice() {
  const [price, setPrice] = useState<number>(cachedPrice?.usd ?? FALLBACK_XTZ_PRICE);
  const [isLoading, setIsLoading] = useState(!cachedPrice);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      // Check if we have a valid cached price
      if (cachedPrice && Date.now() - cachedPrice.lastUpdated < CACHE_DURATION) {
        setPrice(cachedPrice.usd);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }

        const data = await response.json();
        const usdPrice = data.tezos?.usd ?? FALLBACK_XTZ_PRICE;

        // Update cache
        cachedPrice = {
          usd: usdPrice,
          lastUpdated: Date.now(),
        };

        setPrice(usdPrice);
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch XTZ price, using fallback:', err);
        setPrice(FALLBACK_XTZ_PRICE);
        setError('Using estimated price');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();

    // Refresh price every 60 seconds
    const interval = setInterval(fetchPrice, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

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
