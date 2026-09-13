import React from 'react';
import { TickerStats } from '../types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsBarProps {
  stats: TickerStats | null;
  currentPrice: number | null;
  symbol: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, currentPrice, symbol }) => {
  const displayPrice = currentPrice !== null ? currentPrice : stats ? parseFloat(stats.lastPrice) : 0;
  const priceChange = stats ? parseFloat(stats.priceChange) : 0;
  const priceChangePercent = stats ? parseFloat(stats.priceChangePercent) : 0;
  const isPositive = priceChange >= 0;

  const high24h = stats ? parseFloat(stats.highPrice).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-';
  const low24h = stats ? parseFloat(stats.lowPrice).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-';
  const volume24h = stats ? parseFloat(stats.volume).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-';
  const quoteVolume24h = stats ? parseFloat(stats.quoteVolume).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-';

  return (
    <div className="bg-[#181a20] border-b border-[#2b313a] px-4 py-2 flex flex-wrap items-center gap-6 text-xs">
      {/* Price & Change */}
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-bold font-mono text-white">
          ${displayPrice ? displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '---.--'}
        </span>
        <div
          className={`flex items-center font-mono font-semibold gap-0.5 ${
            isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'
          }`}
        >
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>
            {isPositive ? '+' : ''}
            {priceChange.toFixed(2)} ({isPositive ? '+' : ''}
            {priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="h-4 w-px bg-[#2b313a]" />

      {/* 24h High */}
      <div className="flex flex-col">
        <span className="text-[#848e9c] text-[10px]">24h High</span>
        <span className="font-mono text-white font-medium">${high24h}</span>
      </div>

      {/* 24h Low */}
      <div className="flex flex-col">
        <span className="text-[#848e9c] text-[10px]">24h Low</span>
        <span className="font-mono text-white font-medium">${low24h}</span>
      </div>

      {/* 24h Base Volume */}
      <div className="flex flex-col">
        <span className="text-[#848e9c] text-[10px]">24h Volume ({symbol.replace('USDT', '')})</span>
        <span className="font-mono text-white font-medium">{volume24h}</span>
      </div>

      {/* 24h USDT Volume */}
      <div className="flex flex-col">
        <span className="text-[#848e9c] text-[10px]">24h Turnover (USDT)</span>
        <span className="font-mono text-[#848e9c] font-medium">${quoteVolume24h}</span>
      </div>
    </div>
  );
};
