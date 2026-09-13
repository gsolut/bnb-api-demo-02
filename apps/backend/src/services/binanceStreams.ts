import { SpotWebsocketStreams } from '@binance/spot';
import { binanceWebsocketStreams } from './binanceConnector.js';
import { KlineBar } from '../types/binance.js';

export type KlineCallback = (symbol: string, interval: string, bar: KlineBar) => void;
export type TradeCallback = (symbol: string, trade: { id: number; price: number; amount: number; time: number; isBuyerMaker: boolean }) => void;

type StreamsConnection = SpotWebsocketStreams.WebsocketStreamsConnection;

interface StreamHandle {
  on(event: 'message', listener: (data: any) => void): void;
  unsubscribe(): void;
}

interface StreamSubscription {
  symbol: string;
  interval: string;
  stream: StreamHandle | null;
  isConnecting: boolean;
  refCount: number;
}

export class BinanceStreamsManager {
  private connection: StreamsConnection | null = null;
  private connectionPromise: Promise<StreamsConnection> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
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

  public subscribeKline(symbol: string, interval: string) {
    const key = `${symbol.toLowerCase()}@kline_${interval}`;
    let sub = this.klineSubscriptions.get(key);

    if (!sub) {
      sub = {
        symbol: symbol.toUpperCase(),
        interval,
        stream: null,
        isConnecting: false,
        refCount: 1,
      };
      this.klineSubscriptions.set(key, sub);
      void this.connectKlineStream(key, sub);
    } else {
      sub.refCount++;
    }
  }

  public unsubscribeKline(symbol: string, interval: string) {
    const key = `${symbol.toLowerCase()}@kline_${interval}`;
    const sub = this.klineSubscriptions.get(key);
    if (!sub) return;

    sub.refCount--;
    if (sub.refCount <= 0) {
      sub.stream?.unsubscribe();
      this.klineSubscriptions.delete(key);
      this.disconnectWhenIdle();
    }
  }

  public subscribeTrade(symbol: string) {
    const key = `${symbol.toLowerCase()}@trade`;
    let sub = this.tradeSubscriptions.get(key);

    if (!sub) {
      sub = {
        symbol: symbol.toUpperCase(),
        interval: '',
        stream: null,
        isConnecting: false,
        refCount: 1,
      };
      this.tradeSubscriptions.set(key, sub);
      void this.connectTradeStream(key, sub);
    } else {
      sub.refCount++;
    }
  }

  public unsubscribeTrade(symbol: string) {
    const key = `${symbol.toLowerCase()}@trade`;
    const sub = this.tradeSubscriptions.get(key);
    if (!sub) return;

    sub.refCount--;
    if (sub.refCount <= 0) {
      sub.stream?.unsubscribe();
      this.tradeSubscriptions.delete(key);
      this.disconnectWhenIdle();
    }
  }

  private async connectKlineStream(key: string, sub: StreamSubscription) {
    if (sub.isConnecting || sub.stream) return;
    sub.isConnecting = true;

    try {
      const connection = await this.getConnection();
      if (!this.klineSubscriptions.has(key)) return;

      const stream = connection.kline({
        symbol: sub.symbol.toLowerCase(),
        interval: sub.interval as any,
      });
      sub.stream = stream;
      sub.isConnecting = false;

      stream.on('message', (payload) => {
        if (payload.e !== 'kline' || !payload.k) return;

        const k = payload.k;
        const bar: KlineBar = {
          time: Math.floor(Number(k.t) / 1000),
          open: parseFloat(String(k.o)),
          high: parseFloat(String(k.h)),
          low: parseFloat(String(k.l)),
          close: parseFloat(String(k.c)),
          volume: parseFloat(String(k.v)),
          isClosed: Boolean(k.x),
        };

        for (const listener of this.klineListeners) {
          listener(sub.symbol, sub.interval, bar);
        }
      });
    } catch (error) {
      sub.isConnecting = false;
      this.handleConnectionError(key, error);
    }
  }

  private async connectTradeStream(key: string, sub: StreamSubscription) {
    if (sub.isConnecting || sub.stream) return;
    sub.isConnecting = true;

    try {
      const connection = await this.getConnection();
      if (!this.tradeSubscriptions.has(key)) return;

      const stream = connection.aggTrade({ symbol: sub.symbol.toLowerCase() });
      sub.stream = stream;
      sub.isConnecting = false;

      stream.on('message', (payload) => {
        if (payload.e !== 'aggTrade' && payload.e !== 'trade') return;

        const trade = {
          id: Number(payload.a),
          price: parseFloat(String(payload.p)),
          amount: parseFloat(String(payload.q)),
          time: Math.floor(Number(payload.T) / 1000),
          isBuyerMaker: Boolean(payload.m),
        };

        for (const listener of this.tradeListeners) {
          listener(sub.symbol, trade);
        }
      });
    } catch (error) {
      sub.isConnecting = false;
      this.handleConnectionError(key, error);
    }
  }

  private async getConnection(): Promise<StreamsConnection> {
    if (this.connection) return this.connection;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = binanceWebsocketStreams.connect().then((connection) => {
      this.connection = connection;
      this.reconnectAttempts = 0;
      connection.on('error', (error) => this.handleConnectionError('', error));
      connection.on('close', () => this.handleConnectionClosed());
      return connection;
    }).finally(() => {
      this.connectionPromise = null;
    });

    return this.connectionPromise;
  }

  private handleConnectionError(key: string, error: unknown) {
    console.error(`[Binance WS Streams] Connection error${key ? ` for ${key}` : ''}:`, error);
    const connection = this.connection;
    this.resetStreams();
    if (connection) void connection.disconnect();
    this.scheduleReconnect();
  }

  private handleConnectionClosed() {
    this.resetStreams();
    this.scheduleReconnect();
  }

  private resetStreams() {
    this.connection = null;
    for (const sub of [...this.klineSubscriptions.values(), ...this.tradeSubscriptions.values()]) {
      sub.stream = null;
      sub.isConnecting = false;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.klineSubscriptions.size === 0 && this.tradeSubscriptions.size === 0) return;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      for (const [key, sub] of this.klineSubscriptions) void this.connectKlineStream(key, sub);
      for (const [key, sub] of this.tradeSubscriptions) void this.connectTradeStream(key, sub);
    }, delay);
  }

  private disconnectWhenIdle() {
    if (this.klineSubscriptions.size > 0 || this.tradeSubscriptions.size > 0) return;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const connection = this.connection;
    this.connection = null;
    if (connection) void connection.disconnect();
  }
}

export const binanceStreamsManager = new BinanceStreamsManager();
