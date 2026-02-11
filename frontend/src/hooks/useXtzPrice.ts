import { useState, useEffect, useCallback, useRef } from 'react';

// Fallback price (~$1.20 USD per XTZ)
const FALLBACK_XTZ_PRICE = 1.20;

// Cache duration: 60 seconds
const CACHE_DURATION_MS = 60 * 1000;

// CoinGecko public API endpoint
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd';

interface PriceCache {
  price: number;
  timestamp: number;
}

// Global cache shared across all hook instances
let globalCache: PriceCache | null = null;
let fetchPromise: Promise<number> | null = null;

async function fetchXtzPrice(): Promise<number> {
  // Check if we have a valid cached price
  if (globalCache && Date.now() - globalCache.timestamp < CACHE_DURATION_MS) {
    return globalCache.price;
  }

  // If there's already a fetch in progress, wait for it
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start a new fetch
  fetchPromise = (async () => {
    try {
      const response = await fetch(COINGECKO_API_URL);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const price = data?.tezos?.usd;

      if (typeof price !== 'number' || price <= 0) {
        throw new Error('Invalid price data');
      }

      // Update global cache
      globalCache = {
        price,
        timestamp: Date.now(),
      };

      return price;
    } catch (error) {
      console.warn('Failed to fetch XTZ price, using fallback:', error);

      // If we have a stale cache, use it
      if (globalCache) {
        return globalCache.price;
      }

      return FALLBACK_XTZ_PRICE;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function useXtzPrice() {
  const [price, setPrice] = useState<number>(globalCache?.price ?? FALLBACK_XTZ_PRICE);
  const [isLoading, setIsLoading] = useState(!globalCache);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const loadPrice = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPrice = await fetchXtzPrice();

        if (mountedRef.current) {
          setPrice(fetchedPrice);
          setIsLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch price');
          setIsLoading(false);
        }
      }
    };

    loadPrice();

    // Refresh price every 60 seconds
    const intervalId = setInterval(loadPrice, CACHE_DURATION_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  // Convert XTZ amount to USD
  const convertXtzToFiat = useCallback((xtzAmount: number): number => {
    return xtzAmount * price;
  }, [price]);

  // Convert USD amount to XTZ
  const convertFiatToXtz = useCallback((fiatAmount: number): number => {
    if (price === 0) return 0;
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
  return globalCache?.price ?? FALLBACK_XTZ_PRICE;
}

// Force refresh the price cache
export async function refreshXtzPrice(): Promise<number> {
  globalCache = null;
  return fetchXtzPrice();
}
