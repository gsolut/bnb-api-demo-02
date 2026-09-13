import { SPOT_REST_API_PROD_URL, SPOT_WS_API_PROD_URL, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot';

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
export const BINANCE_REST_BASE_URL = process.env.BINANCE_REST_URL || SPOT_REST_API_PROD_URL;
export const BINANCE_WS_API_URL = process.env.BINANCE_WS_API_URL || SPOT_WS_API_PROD_URL;
export const BINANCE_WS_STREAMS_URL = process.env.BINANCE_WS_STREAMS_URL || process.env.BINANCE_WS_URL || SPOT_WS_STREAMS_PROD_URL;

export const SUPPORTED_SYMBOLS = [
  { symbol: 'ETHUSDT', name: 'Ethereum / Tether', baseAsset: 'ETH', quoteAsset: 'USDT' },
  { symbol: 'BTCUSDT', name: 'Bitcoin / Tether', baseAsset: 'BTC', quoteAsset: 'USDT' },
  { symbol: 'SOLUSDT', name: 'Solana / Tether', baseAsset: 'SOL', quoteAsset: 'USDT' },
  { symbol: 'BNBUSDT', name: 'BNB / Tether', baseAsset: 'BNB', quoteAsset: 'USDT' },
  { symbol: 'ADAUSDT', name: 'Cardano / Tether', baseAsset: 'ADA', quoteAsset: 'USDT' },
  { symbol: 'XRPUSDT', name: 'Ripple / Tether', baseAsset: 'XRP', quoteAsset: 'USDT' }
];

export const SUPPORTED_INTERVALS = ['1s', '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'];
export const DEFAULT_SYMBOL = 'ETHUSDT';
export const DEFAULT_INTERVAL = '1m';
