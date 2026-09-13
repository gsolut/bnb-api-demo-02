import React from 'react';
import { TradeSignal } from '../types/market';
import { TrendingUp, TrendingDown, Bell, CheckCircle2 } from 'lucide-react';

interface SignalsPanelProps {
  signals: TradeSignal[];
  symbol: string;
}

export const SignalsPanel: React.FC<SignalsPanelProps> = ({ signals, symbol }) => {
  const recentSignals = [...signals].reverse().slice(0, 15);

  return (
    <div className="bg-[#181a20] border-t border-[#2b313a] p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Bell className="w-4 h-4 text-[#f0b90b]" />
          <span>Detección de Operaciones Conocidas en {symbol}</span>
        </div>
        <span className="text-[11px] text-[#848e9c]">
          Estrategias: EMA Cross (9/21), RSI (14) Mean Reversion
        </span>
      </div>

      {recentSignals.length === 0 ? (
        <div className="text-center py-3 text-[#848e9c] bg-[#0b0e11] rounded-lg border border-[#2b313a]/50">
          Analizando serie temporal... No se detectaron cruces recientes en este rango.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 overflow-x-auto">
          {recentSignals.map((signal, idx) => {
            const isBuy = signal.type === 'BUY';
            const dateStr = new Date(signal.time * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={`${signal.time}-${idx}`}
                className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                  isBuy
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-[#eaecef]'
                    : 'bg-rose-950/20 border-rose-800/40 text-[#eaecef]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md mt-0.5 ${
                    isBuy ? 'bg-[#0ecb81]/20 text-[#0ecb81]' : 'bg-[#f6465d]/20 text-[#f6465d]'
                  }`}
                >
                  {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`font-bold font-mono text-xs ${
                        isBuy ? 'text-[#0ecb81]' : 'text-[#f6465d]'
                      }`}
                    >
                      {signal.type} • {signal.strategy}
                    </span>
                    <span className="text-[10px] text-[#848e9c] font-mono">{dateStr}</span>
                  </div>
                  <p className="text-[11px] text-[#848e9c] mt-0.5 truncate">{signal.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                    <span className="text-[#848e9c]">Precio Ejecución:</span>
                    <span className="text-white font-semibold">${signal.price.toFixed(2)}</span>
                    <span className="ml-auto text-[10px] text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verificada
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
