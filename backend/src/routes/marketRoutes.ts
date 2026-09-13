import { Router, Request, Response } from 'express';
import { binanceRestService } from '../services/binanceRest.js';
import { SUPPORTED_SYMBOLS, SUPPORTED_INTERVALS, DEFAULT_SYMBOL, DEFAULT_INTERVAL } from '../config/constants.js';

const router = Router();

/**
 * GET /api/market/symbols
 * Returns supported trading pairs.
 */
router.get('/symbols', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: SUPPORTED_SYMBOLS,
    intervals: SUPPORTED_INTERVALS,
  });
});

/**
 * GET /api/market/klines
 * Query params: symbol, interval, limit, startTime, endTime
 */
router.get('/klines', async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = (req.query.symbol as string) || DEFAULT_SYMBOL;
    const interval = (req.query.interval as string) || DEFAULT_INTERVAL;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 500;
    const startTime = req.query.startTime ? parseInt(req.query.startTime as string, 10) : undefined;
    const endTime = req.query.endTime ? parseInt(req.query.endTime as string, 10) : undefined;

    const klines = await binanceRestService.getKlines(symbol, interval, limit, startTime, endTime);

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      interval,
      count: klines.length,
      data: klines,
    });
  } catch (error: any) {
    console.error('Error in /api/market/klines:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical klines from Binance',
      details: error.message,
    });
  }
});

/**
 * GET /api/market/stats
 * Query param: symbol
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = (req.query.symbol as string) || DEFAULT_SYMBOL;
    const stats = await binanceRestService.get24hrStats(symbol);

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: stats,
    });
  } catch (error: any) {
    console.error('Error in /api/market/stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch 24h ticker statistics',
      details: error.message,
    });
  }
});

/**
 * GET /api/market/health
 */
router.get('/health', async (_req: Request, res: Response) => {
  const binanceOnline = await binanceRestService.ping();
  res.json({
    success: true,
    status: 'healthy',
    binanceApiConnected: binanceOnline,
    timestamp: new Date().toISOString(),
  });
});

export default router;
