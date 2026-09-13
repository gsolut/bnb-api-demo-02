import axios from 'axios';
import { BINANCE_REST_BASE_URL } from '../config/constants.js';
import { BinanceRawKline, KlineBar, Binance24hrStats } from '../types/binance.js';

export class BinanceRestService {
  private client = axios.create({
    baseURL: BINANCE_REST_BASE_URL,
    timeout: 10000,
  });

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
    const params: Record<string, any> = {
      symbol: symbol.toUpperCase(),
      interval,
      limit: Math.min(limit, 1000),
    };

    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const response = await this.client.get<BinanceRawKline[]>('/klines', { params });
    
    return response.data.map((item) => ({
      time: Math.floor(item[0] / 1000), // Convert ms to seconds
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
      isClosed: true,
    }));
  }

  /**
   * Fetch 24hr ticker price change statistics.
   */
  async get24hrStats(symbol: string = 'ETHUSDT'): Promise<Binance24hrStats> {
    const response = await this.client.get<Binance24hrStats>('/ticker/24hr', {
      params: { symbol: symbol.toUpperCase() },
    });
    return response.data;
  }

  /**
   * Check Binance API health / connectivity.
   */
  async ping(): Promise<boolean> {
    try {
      const res = await this.client.get('/ping');
      return res.status === 200;
    } catch {
      return false;
    }
  }
}

export const binanceRestService = new BinanceRestService();
