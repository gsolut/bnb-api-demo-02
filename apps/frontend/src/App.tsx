import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { IndicatorsMenu } from './components/IndicatorsMenu';
import { TradingChart } from './components/TradingChart';
import { RecentTrades } from './components/RecentTrades';
import { SignalsPanel } from './components/SignalsPanel';
import { useBinanceWs } from './hooks/useBinanceWs';
import { fetchSymbols, fetchHistoricalKlines, fetchTickerStats } from './services/api';
import { SymbolInfo, KlineBar, TradeItem, TickerStats, ActiveIndicators, IndicatorType, TradeSignal } from './types/market';

export function App() {
  const [symbols, setSymbols] = useState<SymbolInfo[]>([]);
  const [intervals, setIntervals] = useState<string[]>(['1m', '5m', '15m', '1h', '4h', '1d']);
  const [currentSymbol, setCurrentSymbol] = useState<string>('ETHUSDT');
  const [currentInterval, setCurrentInterval] = useState<string>('1m');

  const [bars, setBars] = useState<KlineBar[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [stats, setStats] = useState<TickerStats | null>(null);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [indicators, setIndicators] = useState<ActiveIndicators>({
    sma20: true,
    sma50: false,
    sma200: false,
    ema9: true,
    ema21: true,
    rsi: true,
    bollinger: false,
    signals: true,
  });

  // 1. Fetch initial symbols on mount
  useEffect(() => {
    async function loadInitial() {
      const res = await fetchSymbols();
      setSymbols(res.symbols);
      if (res.intervals && res.intervals.length > 0) {
        setIntervals(res.intervals);
      }
    }
    loadInitial();
  }, []);

  // 2. Fetch historical klines and 24h stats whenever symbol or interval changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setIsLoading(true);
      try {
        const [historicalBars, tickerStats] = await Promise.all([
          fetchHistoricalKlines(currentSymbol, currentInterval, 500),
          fetchTickerStats(currentSymbol),
        ]);

        if (!isCancelled) {
          setBars(historicalBars);
          setStats(tickerStats);
          setTrades([]); // reset trades on symbol switch
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading historical chart data:', err);
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [currentSymbol, currentInterval]);

  // Periodic stats refresh
  useEffect(() => {
    const timer = setInterval(async () => {
      const tickerStats = await fetchTickerStats(currentSymbol);
      if (tickerStats) setStats(tickerStats);
    }, 10000);

    return () => clearInterval(timer);
  }, [currentSymbol]);

  // 3. Handle live Kline WebSocket updates
  const handleKlineUpdate = useCallback((liveBar: KlineBar) => {
    setBars((prevBars) => {
      if (prevBars.length === 0) return [liveBar];

      const lastBar = prevBars[prevBars.length - 1];

      if (liveBar.time === lastBar.time) {
        // Update current active candle in-place
        const updated = [...prevBars];
        updated[updated.length - 1] = {
          ...lastBar,
          high: Math.max(lastBar.high, liveBar.high),
          low: Math.min(lastBar.low, liveBar.low),
          close: liveBar.close,
          volume: liveBar.volume,
          isClosed: liveBar.isClosed,
        };
        return updated;
      } else if (liveBar.time > lastBar.time) {
        // New candle opened
        return [...prevBars.slice(-1000), liveBar];
      }

      return prevBars;
    });
  }, []);

  // 4. Handle live Trade WebSocket updates
  const handleTradeUpdate = useCallback((trade: TradeItem) => {
    setTrades((prevTrades) => [trade, ...prevTrades.slice(0, 49)]);
  }, []);

  // Connect WebSocket
  const { isConnected } = useBinanceWs({
    symbol: currentSymbol,
    interval: currentInterval,
    onKlineUpdate: handleKlineUpdate,
    onTradeUpdate: handleTradeUpdate,
  });

  const toggleIndicator = (key: IndicatorType) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignalsDetected = useCallback((detectedSignals: TradeSignal[]) => {
    setSignals(detectedSignals);
  }, []);

  const latestPrice = trades.length > 0 ? trades[0].price : bars.length > 0 ? bars[bars.length - 1].close : null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0e11] text-[#eaecef]">
      {/* Top Header */}
      <Header
        symbols={symbols}
        currentSymbol={currentSymbol}
        onSelectSymbol={setCurrentSymbol}
        intervals={intervals}
        currentInterval={currentInterval}
        onSelectInterval={setCurrentInterval}
        isConnected={isConnected}
      />

      {/* 24hr Stats Ribbon */}
      <StatsBar stats={stats} currentPrice={latestPrice} symbol={currentSymbol} />

      {/* Indicators Toolbar */}
      <IndicatorsMenu indicators={indicators} onToggle={toggleIndicator} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Interactive Chart & Signals */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#2b313a]">
          <div className="flex-1 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121418] z-20 gap-3">
                <div className="w-8 h-8 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-[#848e9c] font-mono">Cargando velas históricas de Binance...</span>
              </div>
            ) : null}

            <TradingChart
              bars={bars}
              indicators={indicators}
              symbol={currentSymbol}
              interval={currentInterval}
              onSignalsDetected={handleSignalsDetected}
            />
          </div>

          {/* Signals / Known Operations Panel at bottom */}
          <SignalsPanel signals={signals} symbol={currentSymbol} />
        </div>

        {/* Right Sidebar: Realtime Trades */}
        <div className="w-80 flex-shrink-0 hidden md:block">
          <RecentTrades trades={trades} symbol={currentSymbol} />
        </div>
      </div>
    </div>
  );
}

export default App;
