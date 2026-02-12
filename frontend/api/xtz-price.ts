// Vercel Edge Function to proxy CoinGecko API (avoids CORS issues)
export const config = {
  runtime: 'edge',
};

export default async function handler() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tezos&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    // Return fallback price on error
    return new Response(JSON.stringify({ tezos: { usd: 1.20 } }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
