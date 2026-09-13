import { WebSocketServer, WebSocket, RawData } from 'ws';
import { Server as HttpServer } from 'http';
import { binanceStreamsManager } from '../services/binanceStreams.js';
import { ClientWsMessage, ServerWsPayload, KlineBar } from '../types/binance.js';

interface ClientState {
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>; // Set of `symbol@interval` or `symbol@trade`
}

export class ClientSocketServer {
  private wss: WebSocketServer;
  private clients: Map<WebSocket, ClientState> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket) => {
      const state: ClientState = {
        ws,
        isAlive: true,
        subscriptions: new Set(),
      };
      this.clients.set(ws, state);

      console.log(`[Client WS] New client connected. Total clients: ${this.clients.size}`);

      // Send welcome message
      this.sendTo(ws, {
        type: 'INFO',
        symbol: '',
        message: 'Connected to Binance Proxy WebSocket Gateway',
        timestamp: Date.now(),
      });

      ws.on('pong', () => {
        state.isAlive = true;
      });

      ws.on('message', (data: RawData) => {
        try {
          const msg: ClientWsMessage = JSON.parse(data.toString());
          this.handleClientMessage(state, msg);
        } catch (err: any) {
          this.sendTo(ws, {
            type: 'ERROR',
            symbol: '',
            message: `Invalid message format: ${err.message}`,
            timestamp: Date.now(),
          });
        }
      });

      ws.on('close', () => {
        this.cleanupClient(state);
        this.clients.delete(ws);
        console.log(`[Client WS] Client disconnected. Remaining: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[Client WS] Client error:', err.message);
      });
    });

    // Listen to Binance WS manager broadcasts
    binanceStreamsManager.onKline((symbol, interval, bar: KlineBar) => {
      this.broadcastKline(symbol, interval, bar);
    });

    binanceStreamsManager.onTrade((symbol, trade) => {
      this.broadcastTrade(symbol, trade);
    });

    // Setup heartbeat ping
    this.pingInterval = setInterval(() => {
      for (const [ws, state] of this.clients.entries()) {
        if (!state.isAlive) {
          console.log('[Client WS] Terminating dead client');
          ws.terminate();
          this.clients.delete(ws);
          continue;
        }
        state.isAlive = false;
        ws.ping();
      }
    }, 30000);
  }

  private handleClientMessage(client: ClientState, msg: ClientWsMessage) {
    if (msg.action === 'PING') {
      this.sendTo(client.ws, {
        type: 'PONG',
        symbol: '',
        timestamp: Date.now(),
      });
      return;
    }

    const symbol = (msg.symbol || 'ETHUSDT').toUpperCase();
    const interval = msg.interval || '1m';
    const klineKey = `kline:${symbol}@${interval}`;
    const tradeKey = `trade:${symbol}`;

    if (msg.action === 'SUBSCRIBE') {
      // Unsubscribe existing kline subscriptions for this client if switching pairs/intervals
      for (const sub of Array.from(client.subscriptions)) {
        if (sub.startsWith('kline:')) {
          const [, sAndI] = sub.split(':');
          const [oldSym, oldInt] = sAndI.split('@');
          binanceStreamsManager.unsubscribeKline(oldSym, oldInt);
          client.subscriptions.delete(sub);
        }
        if (sub.startsWith('trade:')) {
          const [, oldSym] = sub.split(':');
          binanceStreamsManager.unsubscribeTrade(oldSym);
          client.subscriptions.delete(sub);
        }
      }

      // Subscribe to new
      binanceStreamsManager.subscribeKline(symbol, interval);
      binanceStreamsManager.subscribeTrade(symbol);
      client.subscriptions.add(klineKey);
      client.subscriptions.add(tradeKey);

      this.sendTo(client.ws, {
        type: 'INFO',
        symbol,
        message: `Subscribed to ${symbol} [${interval}] and trades`,
        timestamp: Date.now(),
      });
    } else if (msg.action === 'UNSUBSCRIBE') {
      if (client.subscriptions.has(klineKey)) {
        binanceStreamsManager.unsubscribeKline(symbol, interval);
        client.subscriptions.delete(klineKey);
      }
      if (client.subscriptions.has(tradeKey)) {
        binanceStreamsManager.unsubscribeTrade(symbol);
        client.subscriptions.delete(tradeKey);
      }
    }
  }

  private cleanupClient(client: ClientState) {
    for (const sub of client.subscriptions) {
      if (sub.startsWith('kline:')) {
        const [, sAndI] = sub.split(':');
        const [sym, int] = sAndI.split('@');
        binanceStreamsManager.unsubscribeKline(sym, int);
      } else if (sub.startsWith('trade:')) {
        const [, sym] = sub.split(':');
        binanceStreamsManager.unsubscribeTrade(sym);
      }
    }
    client.subscriptions.clear();
  }

  private broadcastKline(symbol: string, interval: string, bar: KlineBar) {
    const key = `kline:${symbol.toUpperCase()}@${interval}`;
    const payload: ServerWsPayload = {
      type: 'KLINE',
      symbol: symbol.toUpperCase(),
      data: {
        interval,
        ...bar,
      },
      timestamp: Date.now(),
    };
    const messageStr = JSON.stringify(payload);

    for (const [, state] of this.clients.entries()) {
      if (state.subscriptions.has(key) && state.ws.readyState === WebSocket.OPEN) {
        state.ws.send(messageStr);
      }
    }
  }

  private broadcastTrade(symbol: string, trade: any) {
    const key = `trade:${symbol.toUpperCase()}`;
    const payload: ServerWsPayload = {
      type: 'TRADE',
      symbol: symbol.toUpperCase(),
      data: trade,
      timestamp: Date.now(),
    };
    const messageStr = JSON.stringify(payload);

    for (const [, state] of this.clients.entries()) {
      if (state.subscriptions.has(key) && state.ws.readyState === WebSocket.OPEN) {
        state.ws.send(messageStr);
      }
    }
  }

  private sendTo(ws: WebSocket, payload: ServerWsPayload) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }

  public close() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.wss.close();
  }
}
