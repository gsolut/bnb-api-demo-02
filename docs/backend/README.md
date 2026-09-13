# Backend

The backend is a Node.js, Express, and TypeScript gateway. It exposes market data to the frontend and owns all connections to Binance.

## Run and build

From the repository root:

```bash
pnpm dev:backend
pnpm --filter bnb-backend build
pnpm --filter bnb-backend lint
```

The repository is a pnpm workspace. Run these commands from the root; the `bnb-backend` filter targets the package in `backend/`.

The default HTTP port is `4000`. The process reads `PORT`, `BINANCE_REST_URL`, and `BINANCE_WS_URL` from the environment through `src/config/constants.ts`.

## REST API

All routes are mounted below `/api/market`.

| Endpoint | Behavior |
| --- | --- |
| `GET /symbols` | Returns supported symbols and intervals. |
| `GET /klines?symbol=ETHUSDT&interval=1m&limit=500` | Fetches historical klines from Binance and returns normalized bars. `limit` is capped at 1000. |
| `GET /stats?symbol=ETHUSDT` | Returns Binance 24-hour ticker statistics. |
| `GET /health` | Reports service status and whether Binance responds to `/ping`. |

The root `GET /` endpoint returns a service description and the available endpoint paths.

## WebSocket gateway

Clients connect to `ws://localhost:4000/ws` in direct development, or to `/ws` through the Nginx frontend proxy.

Subscribe to one symbol and interval:

```json
{"action":"SUBSCRIBE","symbol":"ETHUSDT","interval":"1m"}
```

The gateway subscribes that client to both the kline stream for the selected interval and the trade stream for the selected symbol. A later `SUBSCRIBE` replaces the client's current subscriptions. `UNSUBSCRIBE` removes the matching subscriptions. `PING` receives a `PONG` response.

The gateway sends these payloads:

- `KLINE`: normalized OHLCV data with `time` in Unix seconds and `isClosed`.
- `TRADE`: trade id, price, amount, Unix-second time, and `isBuyerMaker`.
- `INFO`: connection and subscription status.
- `ERROR`: invalid client message details.

The Binance manager reference-counts identical subscriptions and reconnects with exponential backoff up to 30 seconds. The client gateway also sends heartbeat pings every 30 seconds and cleans up Binance subscriptions when a client disconnects.

## Main code paths

- `backend/src/routes/marketRoutes.ts`: REST handlers.
- `backend/src/services/binanceRest.ts`: Binance REST client and response normalization.
- `backend/src/services/binanceWs.ts`: Binance stream lifecycle and reference counting.
- `backend/src/ws/socketServer.ts`: local client connections, subscriptions, and broadcasts.