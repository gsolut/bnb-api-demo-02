# ADR 0002: Use React, TypeScript, Vite, and Lightweight Charts for the frontend

- Status: Accepted
- Date: 2026-09-13

## Context

The client must present live market data, interactive candlestick charts, technical indicators, recent trades, and symbol or interval controls. The current frontend is a browser application in `apps/frontend/` and needs a fast development server and a production bundle that Nginx can serve.

## Decision Drivers

- Support a stateful, interactive market workspace.
- Keep indicator calculations and chart updates in the browser.
- Provide TypeScript checks for component, service, and market-data code.
- Produce a static production bundle for the existing Nginx container.
- Reuse an established charting library instead of implementing canvas chart primitives.

## Considered Options

### React with Vite

Matches the existing component model, supports the current hooks and TypeScript setup, and produces a static bundle suitable for Nginx.

### Server-rendered application framework

Would add server-side application concerns that this static client does not need. The backend already owns API and WebSocket access.

### Vanilla TypeScript frontend

Could reduce framework dependencies, but would require hand-built state and component lifecycle management for the live dashboard.

## Decision Outcome

Use React 18 with TypeScript and Vite. Use Tailwind CSS for layout styling, `lightweight-charts` for market charts, and Lucide React for interface icons. Keep REST access in `src/services/api.ts`, WebSocket lifecycle in `src/hooks/useBinanceWs.ts`, and indicator calculations in `src/utils/indicators.ts`.

## Consequences

- The frontend remains a client-rendered application with a static production artifact.
- The browser owns indicator calculations and signal annotations; the backend does not place orders or calculate those signals.
- The application depends on the backend's `/api/market` and `/ws` contracts.
- Chart behavior and live-data state need frontend TypeScript validation and focused tests as the feature set grows.
- Tailwind utility classes keep styling close to components but require the existing Tailwind build configuration.

## Confirmation

The decision is implemented by `apps/frontend/package.json`, `apps/frontend/vite.config.ts`, and the source modules under `apps/frontend/src/`. Verify it with `pnpm --filter bnb-frontend lint` and `pnpm --filter bnb-frontend build`.

## References

- [React documentation](https://react.dev/)
- [Vite documentation](https://vite.dev/)
- [Lightweight Charts documentation](https://tradingview.github.io/lightweight-charts/)