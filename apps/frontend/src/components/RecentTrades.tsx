import React from 'react';
import { TradeItem } from '../types/market';
import { Clock } from 'lucide-react';

interface RecentTradesProps {
  trades: TradeItem[];
  symbol: string;
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades, symbol }) => {
  const quoteAsset = symbol.endsWith('USDT') ? 'USDT' : '';
  const baseAsset = symbol.replace('USDT', '');

  return (
    <div className="bg-[#181a20] border-l border-[#2b313a] flex flex-col h-full overflow-hidden text-xs">
      {/* Title */}
      <div className="px-3 py-2 border-b border-[#2b313a] flex items-center justify-between text-[#848e9c] font-semibold">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#f0b90b]" />
          <span className="text-white">Operaciones en Tiempo Real</span>
        </div>
        <span className="font-mono text-[10px] bg-[#0b0e11] px-1.5 py-0.5 rounded border border-[#2b313a]">
          {trades.length} trades
        </span>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-[#848e9c] font-mono border-b border-[#2b313a]/50">
        <div>Precio ({quoteAsset})</div>
        <div className="text-right">Cantidad ({baseAsset})</div>
        <div className="text-right">Hora</div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2b313a]/20">
        {trades.length === 0 ? (
          <div className="p-4 text-center text-[#848e9c]">Esperando flujo de operaciones...</div>
        ) : (
          trades.map((trade) => {
            const isBuy = !trade.isBuyerMaker; // buyer is taker -> market buy
            const formattedTime = new Date(trade.time * 1000).toLocaleTimeString();

            return (
              <div
                key={trade.id}
                className={`grid grid-cols-3 px-3 py-1 font-mono items-center hover:bg-[#2b313a]/30 transition-colors ${
                  isBuy ? 'flash-buy' : 'flash-sell'
                }`}
              >
                <div className={`font-semibold ${isBuy ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                  {trade.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
                <div className="text-right text-[#eaecef]">
                  {trade.amount.toFixed(4)}
                </div>
                <div className="text-right text-[#848e9c] text-[10px]">
                  {formattedTime}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
