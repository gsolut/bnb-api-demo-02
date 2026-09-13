import { SymbolInfo, KlineBar, TickerStats } from '../types/market';

const API_BASE = '/api/market';

export async function fetchSymbols(): Promise<{ symbols: SymbolInfo[]; intervals: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/symbols`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      symbols: data.data || [],
      intervals: data.intervals || ['1m', '5m', '15m', '1h', '4h', '1d'],
    };
  } catch (err) {
    console.error('Failed to fetch symbols, using fallback', err);
    return {
      symbols: [
        { symbol: 'ETHUSDT', name: 'Ethereum / Tether', baseAsset: 'ETH', quoteAsset: 'USDT' },
        { symbol: 'BTCUSDT', name: 'Bitcoin / Tether', baseAsset: 'BTC', quoteAsset: 'USDT' },
        { symbol: 'SOLUSDT', name: 'Solana / Tether', baseAsset: 'SOL', quoteAsset: 'USDT' },
        { symbol: 'BNBUSDT', name: 'BNB / Tether', baseAsset: 'BNB', quoteAsset: 'USDT' },
      ],
      intervals: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d'],
    };
  }
}

export async function fetchHistoricalKlines(
  symbol: string,
  interval: string,
  limit: number = 500
): Promise<KlineBar[]> {
  const res = await fetch(`${API_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to load klines: HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchTickerStats(symbol: string): Promise<TickerStats | null> {
  try {
    const res = await fetch(`${API_BASE}/stats?symbol=${symbol}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.warn('Failed to fetch ticker stats', err);
    return null;
  }
}
