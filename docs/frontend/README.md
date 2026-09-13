# Frontend

The frontend is a React 18 and TypeScript application built with Vite. It renders a market workspace with symbol and interval selection, 24-hour statistics, a candlestick chart, technical indicators, detected signals, and recent trades.

## Run and build

From the repository root:

```bash
pnpm dev:frontend
pnpm --filter bnb-frontend build
pnpm --filter bnb-frontend lint
```

The repository is a pnpm workspace. Run these commands from the root; the `bnb-frontend` filter targets the application in `apps/frontend/`.

Vite serves the development app at `http://localhost:3000`. In development, the Vite configuration proxies `/api` and `/ws` to the backend. In the container deployment, Nginx provides the same proxy paths.

## Data flow

`App.tsx` owns the selected symbol, interval, historical bars, trades, ticker statistics, detected signals, and active indicator toggles.

1. On mount, `fetchSymbols` loads the backend's supported symbols and intervals.
2. When the symbol or interval changes, the app loads up to 500 historical klines and 24-hour statistics in parallel.
3. `useBinanceWs` connects to `/ws` and subscribes to the selected symbol and interval.
4. Live klines update the current bar or append a newer bar. Live trades are prepended and trimmed to 50 entries.
5. `TradingChart` calculates and renders the enabled overlays and detected operations from the current bars.

## Indicators and signals

The indicator engine in `apps/frontend/src/utils/indicators.ts` calculates:

- SMA for any requested period.
- EMA for any requested period, seeded with an initial SMA.
- RSI with a default period of 14.
- Bollinger Bands with default period 20 and multiplier 2.

Signal detection uses EMA 9/21 crosses and RSI threshold reversals. These are chart annotations and heuristics, not trade execution or financial advice. The frontend does not place orders.

## Main code paths

- `apps/frontend/src/App.tsx`: page state and data orchestration.
- `apps/frontend/src/services/api.ts`: REST requests to `/api/market`.
- `apps/frontend/src/hooks/useBinanceWs.ts`: WebSocket connection, subscription, and reconnect behavior.
- `apps/frontend/src/components/TradingChart.tsx`: Lightweight Charts rendering.
- `apps/frontend/src/utils/indicators.ts`: indicator and signal calculations.