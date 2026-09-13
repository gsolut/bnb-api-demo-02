import WebSocket, { RawData } from 'ws';
import { BINANCE_WS_BASE_URL } from '../config/constants.js';
import { BinanceWsKlineEvent, BinanceWsTradeEvent, KlineBar } from '../types/binance.js';

export type KlineCallback = (symbol: string, interval: string, bar: KlineBar) => void;
export type TradeCallback = (symbol: string, trade: { id: number; price: number; amount: number; time: number; isBuyerMaker: boolean }) => void;

interface StreamSubscription {
  symbol: string;
  interval: string;
  ws: WebSocket | null;
  reconnectAttempts: number;
  isConnecting: boolean;
  refCount: number;
}

export class BinanceWsManager {
  private klineSubscriptions: Map<string, StreamSubscription> = new Map();
  private tradeSubscriptions: Map<string, StreamSubscription> = new Map();
  private klineListeners: Set<KlineCallback> = new Set();
  private tradeListeners: Set<TradeCallback> = new Set();

  public onKline(cb: KlineCallback) {
    this.klineListeners.add(cb);
  }

  public offKline(cb: KlineCallback) {
    this.klineListeners.delete(cb);
  }

  public onTrade(cb: TradeCallback) {
    this.tradeListeners.add(cb);
  }

  public offTrade(cb: TradeCallback) {
    this.tradeListeners.delete(cb);
  }

  /**
   * Subscribe to a symbol & interval kline stream on Binance.
   */
  public subscribeKline(symbol: string, interval: string) {
    const key = `${symbol.toLowerCase()}@kline_${interval}`;
    let sub = this.klineSubscriptions.get(key);

    if (!sub) {
      sub = {
        symbol: symbol.toUpperCase(),
        interval,
        ws: null,
        reconnectAttempts: 0,
        isConnecting: false,
        refCount: 1,
      };
      this.klineSubscriptions.set(key, sub);
      this.connectKlineStream(key, sub);
    } else {
      sub.refCount++;
    }
  }

  /**
   * Unsubscribe from a symbol & interval kline stream.
   */
  public unsubscribeKline(symbol: string, interval: string) {
    const key = `${symbol.toLowerCase()}@kline_${interval}`;
    const sub = this.klineSubscriptions.get(key);
    if (!sub) return;

    sub.refCount--;
    if (sub.refCount <= 0) {
      if (sub.ws && sub.ws.readyState === WebSocket.OPEN) {
        sub.ws.close();
      }
      this.klineSubscriptions.delete(key);
    }
  }

  /**
   * Subscribe to a trade stream.
   */
  public subscribeTrade(symbol: string) {
    const key = `${symbol.toLowerCase()}@trade`;
    let sub = this.tradeSubscriptions.get(key);

    if (!sub) {
      sub = {
        symbol: symbol.toUpperCase(),
        interval: '',
        ws: null,
        reconnectAttempts: 0,
        isConnecting: false,
        refCount: 1,
      };
      this.tradeSubscriptions.set(key, sub);
      this.connectTradeStream(key, sub);
    } else {
      sub.refCount++;
    }
  }

  /**
   * Unsubscribe from trade stream.
   */
  public unsubscribeTrade(symbol: string) {
    const key = `${symbol.toLowerCase()}@trade`;
    const sub = this.tradeSubscriptions.get(key);
    if (!sub) return;

    sub.refCount--;
    if (sub.refCount <= 0) {
      if (sub.ws && sub.ws.readyState === WebSocket.OPEN) {
        sub.ws.close();
      }
      this.tradeSubscriptions.delete(key);
    }
  }

  private connectKlineStream(key: string, sub: StreamSubscription) {
    if (sub.isConnecting) return;
    sub.isConnecting = true;

    const url = `${BINANCE_WS_BASE_URL}/${key}`;
    console.log(`[Binance WS] Connecting to ${url}`);

    const ws = new WebSocket(url);
    sub.ws = ws;

    ws.on('open', () => {
      console.log(`[Binance WS] Connected to ${key}`);
      sub.isConnecting = false;
      sub.reconnectAttempts = 0;
    });

    ws.on('message', (rawData: RawData) => {
      try {
        const payload: BinanceWsKlineEvent = JSON.parse(rawData.toString());
        if (payload.e === 'kline' && payload.k) {
          const k = payload.k;
          const bar: KlineBar = {
            time: Math.floor(k.t / 1000),
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            volume: parseFloat(k.v),
            isClosed: k.x,
          };

          for (const listener of this.klineListeners) {
            listener(sub.symbol, sub.interval, bar);
          }
        }
      } catch (err) {
        console.error(`[Binance WS] Error parsing message for ${key}:`, err);
      }
    });

    ws.on('error', (err) => {
      console.error(`[Binance WS] Error on ${key}:`, err.message);
    });

    ws.on('close', () => {
      console.warn(`[Binance WS] Closed connection for ${key}`);
      sub.ws = null;
      sub.isConnecting = false;

      // Auto reconnect if subscription is still active
      if (this.klineSubscriptions.has(key)) {
        const delay = Math.min(1000 * Math.pow(2, sub.reconnectAttempts), 30000);
        sub.reconnectAttempts++;
        console.log(`[Binance WS] Reconnecting ${key} in ${delay}ms (attempt ${sub.reconnectAttempts})`);
        setTimeout(() => {
          if (this.klineSubscriptions.has(key)) {
            this.connectKlineStream(key, sub);
          }
        }, delay);
      }
    });
  }

  private connectTradeStream(key: string, sub: StreamSubscription) {
    if (sub.isConnecting) return;
    sub.isConnecting = true;

    const url = `${BINANCE_WS_BASE_URL}/${key}`;
    const ws = new WebSocket(url);
    sub.ws = ws;

    ws.on('open', () => {
      console.log(`[Binance WS] Connected to trade stream ${key}`);
      sub.isConnecting = false;
      sub.reconnectAttempts = 0;
    });

    ws.on('message', (rawData: RawData) => {
      try {
        const payload: BinanceWsTradeEvent = JSON.parse(rawData.toString());
        if (payload.e === 'trade') {
          const trade = {
            id: payload.t,
            price: parseFloat(payload.p),
            amount: parseFloat(payload.q),
            time: Math.floor(payload.T / 1000),
            isBuyerMaker: payload.m,
          };

          for (const listener of this.tradeListeners) {
            listener(sub.symbol, trade);
          }
        }
      } catch (err) {
        console.error(`[Binance WS] Error parsing trade message for ${key}:`, err);
      }
    });

    ws.on('error', (err) => {
      console.error(`[Binance WS] Error on trade ${key}:`, err.message);
    });

    ws.on('close', () => {
      console.warn(`[Binance WS] Closed trade connection for ${key}`);
      sub.ws = null;
      sub.isConnecting = false;

      if (this.tradeSubscriptions.has(key)) {
        const delay = Math.min(1000 * Math.pow(2, sub.reconnectAttempts), 30000);
        sub.reconnectAttempts++;
        setTimeout(() => {
          if (this.tradeSubscriptions.has(key)) {
            this.connectTradeStream(key, sub);
          }
        }, delay);
      }
    });
  }
}

export const binanceWsManager = new BinanceWsManager();
