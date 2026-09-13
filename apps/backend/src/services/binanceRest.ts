import { binanceRestAPI } from './binanceConnector.js';
import { KlineBar, Binance24hrStats } from '../types/binance.js';

export class BinanceRestService {
  /**
   * Fetch historical klines / candlesticks from Binance REST API.
   * Formats response into typed KlineBar array suitable for Lightweight Charts.
   */
  async getKlines(
    symbol: string = 'ETHUSDT',
    interval: string = '1m',
    limit: number = 500,
    startTime?: number,
    endTime?: number
  ): Promise<KlineBar[]> {
    const params = {
      symbol: symbol.toUpperCase(),
      interval,
      limit: Math.min(limit, 1000),
      ...(startTime === undefined ? {} : { startTime }),
      ...(endTime === undefined ? {} : { endTime }),
    };

    const response = await binanceRestAPI.klines(params as Parameters<typeof binanceRestAPI.klines>[0]);
    const data = await response.data();
    
    return data.map((item) => ({
      time: Math.floor(Number(item[0]) / 1000),
      open: parseFloat(String(item[1])),
      high: parseFloat(String(item[2])),
      low: parseFloat(String(item[3])),
      close: parseFloat(String(item[4])),
      volume: parseFloat(String(item[5])),
      isClosed: true,
    }));
  }

  /**
   * Fetch 24hr ticker price change statistics.
   */
  async get24hrStats(symbol: string = 'ETHUSDT'): Promise<Binance24hrStats> {
    const response = await binanceRestAPI.ticker24hr({ symbol: symbol.toUpperCase() });
    return (await response.data()) as Binance24hrStats;
  }

  /**
   * Check Binance API health / connectivity.
   */
  async ping(): Promise<boolean> {
    try {
      await binanceRestAPI.ping();
      return true;
    } catch {
      return false;
    }
  }
}

export const binanceRestService = new BinanceRestService();
