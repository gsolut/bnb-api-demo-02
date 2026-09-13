# ADR 0003: Use Node.js, TypeScript, Express, Axios, and ws for the backend

- Status: Accepted
- Date: 2026-09-13

## Context

The backend must expose HTTP market-data endpoints, maintain outbound Binance REST and WebSocket connections, and broadcast normalized live data to browser clients. It is a small gateway service rather than a database-backed application or order execution system.

## Decision Drivers

- Support HTTP routes and long-lived WebSocket connections in one service.
- Share typed market-data contracts across REST normalization and gateway code.
- Use a small dependency set appropriate for a proxy service.
- Preserve the existing Docker and TypeScript build flow.
- Allow subscription reference counting and reconnect handling around Binance streams.

## Considered Options

### Node.js with Express and ws

Matches the existing service, provides the required HTTP and WebSocket primitives, and keeps REST and streaming integrations in one TypeScript process.

### Python web framework

Could support the same protocols, but would introduce a second runtime and rewrite the existing TypeScript service without a current product requirement.

### A managed streaming or API gateway

Could offload connection management, but would add external infrastructure and configuration for a service that currently has one upstream provider.

## Decision Outcome

Use Node.js with TypeScript. Use Express for HTTP routing and middleware, Axios for Binance REST requests, and `ws` for Binance and client WebSocket connections. Keep outbound integrations in `src/services/`, HTTP routes in `src/routes/`, and the browser gateway in `src/ws/`.

## Consequences

- The backend can normalize Binance responses before exposing them to the frontend.
- The service owns reconnect, reference counting, heartbeat, and client cleanup behavior.
- The gateway is stateless across process restarts; active subscriptions must be rebuilt by clients.
- The current public market-data integration does not require a database or Binance credentials.
- CORS, input validation, rate limiting, and authentication need stricter production policies before public exposure.

## Confirmation

The decision is implemented by `apps/backend/package.json` and the modules under `apps/backend/src/`. Verify it with `pnpm --filter bnb-backend lint` and `pnpm --filter bnb-backend build`.

## References

- [Node.js documentation](https://nodejs.org/docs/latest/api/)
- [Express documentation](https://expressjs.com/)
- [ws documentation](https://github.com/websockets/ws)