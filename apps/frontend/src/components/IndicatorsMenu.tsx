import React from 'react';
import { ActiveIndicators, IndicatorType } from '../types/market';
import { Sliders, Zap } from 'lucide-react';

interface IndicatorsMenuProps {
  indicators: ActiveIndicators;
  onToggle: (indicator: IndicatorType) => void;
}

export const IndicatorsMenu: React.FC<IndicatorsMenuProps> = ({ indicators, onToggle }) => {
  const indicatorConfigs: { key: IndicatorType; label: string; color: string; badge?: string }[] = [
    { key: 'sma20', label: 'SMA 20', color: '#f59e0b' },
    { key: 'sma50', label: 'SMA 50', color: '#3b82f6' },
    { key: 'sma200', label: 'SMA 200', color: '#a855f7' },
    { key: 'ema9', label: 'EMA 9', color: '#06b6d4' },
    { key: 'ema21', label: 'EMA 21', color: '#ec4899' },
    { key: 'bollinger', label: 'Bollinger (20,2)', color: '#6366f1' },
    { key: 'rsi', label: 'RSI (14)', color: '#10b981' },
    { key: 'signals', label: 'Operaciones Conocidas (Señales)', color: '#f0b90b', badge: 'PRO' },
  ];

  return (
    <div className="bg-[#181a20] border-b border-[#2b313a] px-4 py-2 flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-[#848e9c] mr-2">
        <Sliders className="w-3.5 h-3.5" />
        <span className="font-semibold text-white">Indicadores & Señales:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {indicatorConfigs.map(({ key, label, color, badge }) => {
          const isActive = indicators[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-[#1e2329] text-white border-[#474d57] shadow-sm'
                  : 'bg-[#0b0e11] text-[#848e9c] border-transparent hover:text-white hover:border-[#2b313a]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? color : '#4b5563' }}
              />
              <span>{label}</span>
              {badge && (
                <span className="bg-[#f0b90b]/20 text-[#f0b90b] text-[9px] px-1 py-0.2 rounded font-bold flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
