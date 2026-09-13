# Backend

The backend is a Node.js, Express, and TypeScript gateway. It exposes market data to the frontend and owns all connections to Binance through the official `@binance/spot` connector.

## Run and build

From the repository root:

```bash
pnpm dev:backend
pnpm --filter bnb-backend build
pnpm --filter bnb-backend lint
```

The repository is a pnpm workspace. Run these commands from the root; the `bnb-backend` filter targets the application in `apps/backend/`.

The default HTTP port is `4000`. The process reads `PORT`, `BINANCE_REST_URL`, `BINANCE_WS_API_URL`, and `BINANCE_WS_STREAMS_URL` from the environment through `apps/backend/src/config/constants.ts`. `BINANCE_WS_URL` remains a backward-compatible alias for the Streams URL. Optional `BINANCE_API_KEY` and `BINANCE_API_SECRET` values configure the connector; public market endpoints work with empty credentials.

## REST API

All routes are mounted below `/api/market`.

| Endpoint | Behavior |
| --- | --- |
| `GET /symbols` | Returns supported symbols and intervals. |
| `GET /klines?symbol=ETHUSDT&interval=1m&limit=500` | Fetches historical klines from Binance and returns normalized bars. `limit` is capped at 1000. |
| `GET /stats?symbol=ETHUSDT` | Returns Binance 24-hour ticker statistics. |
| `GET /health` | Reports service status and whether Binance responds to `/ping`. |

The root `GET /` endpoint returns a service description and the available endpoint paths.

## Binance API references

The connector-backed services map to Binance's Spot APIs:

- [Spot REST API](https://developers.binance.com/en/docs/products/spot/rest-api): historical klines, 24-hour ticker statistics, and connectivity checks.
- [Spot WebSocket API](https://developers.binance.com/en/docs/products/spot/web-socket-api): Binance's request/response WebSocket API reference.
- [Spot WebSocket Streams](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/ws-streams/~?lang=ts): realtime kline and aggregate trade streams used by this gateway.
- [Binance API catalog](https://developers.binance.com/en/docs/catalog): product and API directory for endpoint discovery.
- [JavaScript connector](https://developers.binance.com/en/docs/sdks-tools/connectors/javascript): `@binance/spot` installation and client configuration.

## Connector service boundaries

The backend configures one `@binance/spot` client with three distinct services:

| Connector service | Use in this application | Data model |
| --- | --- | --- |
| `restAPI` | Load historical klines, 24-hour statistics, and check connectivity. | Request/response snapshot. |
| `websocketAPI` | Exposed through `binanceWebsocketService` for future request/response operations that this application explicitly needs. | Bidirectional request/response. |
| `websocketStreams` | Feed continuous kline and aggregate-trade events over one shared multiplexed connection. | Server-pushed realtime events. |

REST and the normal WebSocket API can expose overlapping request/response capabilities. The application chooses REST for its current snapshots because it is sufficient for the existing endpoints; it does not implement duplicate WebSocket API methods merely because Binance offers them there. Streams are used only for continuous realtime data.

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

The Binance Streams manager reference-counts identical subscriptions, multiplexes active streams over one upstream connection, reconnects with exponential backoff up to 30 seconds, and disconnects when the last local subscription ends. The client gateway also sends heartbeat pings every 30 seconds and cleans up Binance subscriptions when a client disconnects.

## Main code paths

- `apps/backend/src/routes/marketRoutes.ts`: REST handlers.
- `apps/backend/src/services/binanceConnector.ts`: one configured `Spot` client exposing all three Binance services.
- `apps/backend/src/services/binanceRest.ts`: `@binance/spot` REST client and response normalization.
- `apps/backend/src/services/binanceWebsocket.ts`: normal WebSocket API connection lifecycle.
- `apps/backend/src/services/binanceStreams.ts`: `@binance/spot` realtime stream lifecycle and local reference counting.
- `apps/backend/src/ws/socketServer.ts`: local client connections, subscriptions, and broadcasts.