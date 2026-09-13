export interface SymbolInfo {
  symbol: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
}

export interface KlineBar {
  time: number; // in seconds (for Lightweight Charts)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed?: boolean;
}

export interface TradeItem {
  id: number;
  price: number;
  amount: number;
  time: number;
  isBuyerMaker: boolean;
}

export interface TickerStats {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  askPrice: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  count: number;
}

export type IndicatorType = 'sma20' | 'sma50' | 'sma200' | 'ema9' | 'ema21' | 'rsi' | 'bollinger' | 'signals';

export interface ActiveIndicators {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  ema9: boolean;
  ema21: boolean;
  rsi: boolean;
  bollinger: boolean;
  signals: boolean; // Known operations / strategy trade markers
}

export interface TradeSignal {
  time: number;
  type: 'BUY' | 'SELL';
  strategy: string;
  price: number;
  description: string;
}
