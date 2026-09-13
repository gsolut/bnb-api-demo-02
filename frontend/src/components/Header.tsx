import React from 'react';
import { SymbolInfo } from '../types/market';
import { Activity, Wifi, WifiOff, Layers, Sparkles } from 'lucide-react';

interface HeaderProps {
  symbols: SymbolInfo[];
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  intervals: string[];
  currentInterval: string;
  onSelectInterval: (interval: string) => void;
  isConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  symbols,
  currentSymbol,
  onSelectSymbol,
  intervals,
  currentInterval,
  onSelectInterval,
  isConnected,
}) => {
  return (
    <header className="bg-[#181a20] border-b border-[#2b313a] px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none">
      {/* Brand & Symbol Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f0b90b] to-[#f8d33a] flex items-center justify-center font-bold text-black shadow-md shadow-amber-500/10">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide text-white">BINANCE</span>
            <span className="text-xs text-[#f0b90b] font-mono ml-1.5 px-1.5 py-0.5 rounded bg-[#f0b90b]/10 border border-[#f0b90b]/20">
              PRO PROXY
            </span>
          </div>
        </div>

        {/* Quick Symbol Pills */}
        <div className="flex items-center bg-[#0b0e11] p-1 rounded-lg border border-[#2b313a] gap-1">
          {symbols.map((s) => {
            const isSelected = s.symbol === currentSymbol;
            return (
              <button
                key={s.symbol}
                onClick={() => onSelectSymbol(s.symbol)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#f0b90b] text-black shadow'
                    : 'text-[#848e9c] hover:text-white hover:bg-[#1e2329]'
                }`}
              >
                {s.baseAsset}/{s.quoteAsset}
                {s.symbol === 'ETHUSDT' && (
                  <Sparkles className={`w-3 h-3 ${isSelected ? 'text-black' : 'text-[#f0b90b]'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeframes & Connection State */}
      <div className="flex items-center gap-4">
        {/* Interval Selector */}
        <div className="flex items-center bg-[#0b0e11] p-1 rounded-lg border border-[#2b313a] gap-1">
          <Layers className="w-3.5 h-3.5 text-[#848e9c] ml-1.5 mr-0.5" />
          {intervals.map((int) => (
            <button
              key={int}
              onClick={() => onSelectInterval(int)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all ${
                int === currentInterval
                  ? 'bg-[#2b313a] text-white font-bold'
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              {int}
            </button>
          ))}
        </div>

        {/* Live Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            isConnected
              ? 'bg-emerald-950/40 text-[#0ecb81] border-emerald-800/40'
              : 'bg-rose-950/40 text-[#f6465d] border-rose-800/40'
          }`}
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ecb81] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0ecb81]"></span>
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span>LIVE WS</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>DISCONNECTED</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
