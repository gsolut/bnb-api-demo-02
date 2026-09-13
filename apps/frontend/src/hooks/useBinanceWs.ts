import { useEffect, useRef, useState, useCallback } from 'react';
import { KlineBar, TradeItem } from '../types/market';

interface UseBinanceWsOptions {
  symbol: string;
  interval: string;
  onKlineUpdate?: (bar: KlineBar) => void;
  onTradeUpdate?: (trade: TradeItem) => void;
}

export function useBinanceWs({ symbol, interval, onKlineUpdate, onTradeUpdate }: UseBinanceWsOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const klineCallbackRef = useRef(onKlineUpdate);
  const tradeCallbackRef = useRef(onTradeUpdate);

  useEffect(() => {
    klineCallbackRef.current = onKlineUpdate;
    tradeCallbackRef.current = onTradeUpdate;
  }, [onKlineUpdate, onTradeUpdate]);

  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // In dev vite proxies /ws to backend; in direct setup ws://localhost:4000/ws
    const wsUrl = `${protocol}//${host}/ws`;

    console.log(`[Frontend WS] Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('[Frontend WS] Connected to backend proxy');
      setIsConnected(true);

      // Subscribe to symbol and interval
      ws.send(
        JSON.stringify({
          action: 'SUBSCRIBE',
          symbol,
          interval,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLastMessageTime(Date.now());

        if (payload.type === 'KLINE' && payload.data && payload.symbol === symbol.toUpperCase()) {
          const barData: KlineBar = {
            time: payload.data.time,
            open: payload.data.open,
            high: payload.data.high,
            low: payload.data.low,
            close: payload.data.close,
            volume: payload.data.volume,
            isClosed: payload.data.isClosed,
          };
          if (klineCallbackRef.current) {
            klineCallbackRef.current(barData);
          }
        } else if (payload.type === 'TRADE' && payload.data && payload.symbol === symbol.toUpperCase()) {
          const tradeData: TradeItem = {
            id: payload.data.id,
            price: payload.data.price,
            amount: payload.data.amount,
            time: payload.data.time,
            isBuyerMaker: payload.data.isBuyerMaker,
          };
          if (tradeCallbackRef.current) {
            tradeCallbackRef.current(tradeData);
          }
        }
      } catch (err) {
        console.error('[Frontend WS] Parse error:', err);
      }
    };

    ws.onclose = () => {
      console.warn('[Frontend WS] Disconnected. Scheduling reconnect...');
      setIsConnected(false);
      socketRef.current = null;
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error('[Frontend WS] Error:', err);
    };
  }, [symbol, interval]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastMessageTime,
  };
}
