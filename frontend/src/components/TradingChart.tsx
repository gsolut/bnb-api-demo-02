import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  ColorType,
  CrosshairMode,
  CandlestickData,
  HistogramData,
  LineData,
} from 'lightweight-charts';
import { KlineBar, ActiveIndicators, TradeSignal } from '../types/market';
import {
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  calculateRSI,
  detectKnownOperations,
} from '../utils/indicators';

interface TradingChartProps {
  bars: KlineBar[];
  indicators: ActiveIndicators;
  symbol: string;
  interval: string;
  onSignalsDetected?: (signals: TradeSignal[]) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  bars,
  indicators,
  symbol,
  interval,
  onSignalsDetected,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Indicator series refs
  const sma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Initialize TradingView Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#121418' },
        textColor: '#848e9c',
        fontFamily: "'JetBrains Mono', 'Inter', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1e2329' },
        horzLines: { color: '#1e2329' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#707a8a',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2b313a',
        },
        horzLine: {
          color: '#707a8a',
          width: 1,
          style: 3,
          labelBackgroundColor: '#2b313a',
        },
      },
      timeScale: {
        borderColor: '#2b313a',
        timeVisible: true,
        secondsVisible: interval === '1s',
      },
      rightPriceScale: {
        borderColor: '#2b313a',
        autoScale: true,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#0ecb81',
      downColor: '#f6465d',
      borderVisible: false,
      wickUpColor: '#0ecb81',
      wickDownColor: '#f6465d',
    });
    candlestickSeriesRef.current = candleSeries;

    // 2. Volume Histogram Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // 3. Indicator Overlay Series
    sma20SeriesRef.current = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    sma50SeriesRef.current = chart.addLineSeries({
      color: '#3b82f6',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    sma200SeriesRef.current = chart.addLineSeries({
      color: '#a855f7',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    ema9SeriesRef.current = chart.addLineSeries({
      color: '#06b6d4',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    ema21SeriesRef.current = chart.addLineSeries({
      color: '#ec4899',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Bollinger Bands
    bbUpperSeriesRef.current = chart.addLineSeries({
      color: 'rgba(99, 102, 241, 0.6)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    bbMiddleSeriesRef.current = chart.addLineSeries({
      color: 'rgba(99, 102, 241, 0.9)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    bbLowerSeriesRef.current = chart.addLineSeries({
      color: 'rgba(99, 102, 241, 0.6)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // RSI
    rsiSeriesRef.current = chart.addLineSeries({
      color: '#10b981',
      lineWidth: 2,
      priceScaleId: 'rsi',
    });
    rsiSeriesRef.current.priceScale().applyOptions({
      scaleMargins: {
        top: 0.75,
        bottom: 0.05,
      },
    });

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update Data and Indicators when `bars` or `indicators` changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || bars.length === 0) return;

    // 1. Candlestick Data
    const candleData: CandlestickData<UTCTimestamp>[] = bars.map((b) => ({
      time: b.time as UTCTimestamp,
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    candlestickSeriesRef.current.setData(candleData);

    // 2. Volume Data
    const volumeData: HistogramData<UTCTimestamp>[] = bars.map((b) => ({
      time: b.time as UTCTimestamp,
      value: b.volume,
      color: b.close >= b.open ? 'rgba(14, 203, 129, 0.4)' : 'rgba(246, 70, 93, 0.4)',
    }));
    volumeSeriesRef.current.setData(volumeData);

    // 3. Update Indicators
    if (sma20SeriesRef.current) {
      sma20SeriesRef.current.setData(
        indicators.sma20 ? (calculateSMA(bars, 20) as LineData<UTCTimestamp>[]) : []
      );
    }
    if (sma50SeriesRef.current) {
      sma50SeriesRef.current.setData(
        indicators.sma50 ? (calculateSMA(bars, 50) as LineData<UTCTimestamp>[]) : []
      );
    }
    if (sma200SeriesRef.current) {
      sma200SeriesRef.current.setData(
        indicators.sma200 ? (calculateSMA(bars, 200) as LineData<UTCTimestamp>[]) : []
      );
    }
    if (ema9SeriesRef.current) {
      ema9SeriesRef.current.setData(
        indicators.ema9 ? (calculateEMA(bars, 9) as LineData<UTCTimestamp>[]) : []
      );
    }
    if (ema21SeriesRef.current) {
      ema21SeriesRef.current.setData(
        indicators.ema21 ? (calculateEMA(bars, 21) as LineData<UTCTimestamp>[]) : []
      );
    }

    // Bollinger Bands
    if (bbUpperSeriesRef.current && bbMiddleSeriesRef.current && bbLowerSeriesRef.current) {
      if (indicators.bollinger) {
        const bbData = calculateBollingerBands(bars, 20, 2);
        bbUpperSeriesRef.current.setData(
          bbData.map((d) => ({ time: d.time, value: d.upper })) as LineData<UTCTimestamp>[]
        );
        bbMiddleSeriesRef.current.setData(
          bbData.map((d) => ({ time: d.time, value: d.middle })) as LineData<UTCTimestamp>[]
        );
        bbLowerSeriesRef.current.setData(
          bbData.map((d) => ({ time: d.time, value: d.lower })) as LineData<UTCTimestamp>[]
        );
      } else {
        bbUpperSeriesRef.current.setData([]);
        bbMiddleSeriesRef.current.setData([]);
        bbLowerSeriesRef.current.setData([]);
      }
    }

    // RSI
    if (rsiSeriesRef.current) {
      rsiSeriesRef.current.setData(
        indicators.rsi ? (calculateRSI(bars, 14) as LineData<UTCTimestamp>[]) : []
      );
    }

    // 4. Known Operations Signals & Markers
    const { signals, markers } = detectKnownOperations(bars);
    if (onSignalsDetected) {
      onSignalsDetected(signals);
    }

    if (candlestickSeriesRef.current) {
      candlestickSeriesRef.current.setMarkers(indicators.signals ? markers : []);
    }
  }, [bars, indicators, onSignalsDetected]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#121418]">
      {/* Chart Legend / Top Info */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none">
        <span className="font-bold text-white bg-[#1e2329]/80 px-2 py-0.5 rounded border border-[#2b313a]">
          {symbol} • {interval}
        </span>
        {bars.length > 0 && (
          <div className="flex items-center gap-2 text-[11px] bg-[#1e2329]/80 px-2.5 py-0.5 rounded border border-[#2b313a] backdrop-blur-sm">
            <span>O: <span className="text-white">{bars[bars.length - 1].open}</span></span>
            <span>H: <span className="text-[#0ecb81]">{bars[bars.length - 1].high}</span></span>
            <span>L: <span className="text-[#f6465d]">{bars[bars.length - 1].low}</span></span>
            <span>C: <span className="text-white font-bold">{bars[bars.length - 1].close}</span></span>
            <span>Vol: <span className="text-[#f0b90b]">{bars[bars.length - 1].volume.toFixed(2)}</span></span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
};
