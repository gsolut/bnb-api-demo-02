# Documentation

This directory contains the project documentation. The folders are grouped by document kind so readers can find decisions, system structure, and service-specific details without searching the repository.

## Folders

| Folder | Contents |
| --- | --- |
| [`architecture`](architecture/README.md) | System boundaries, runtime data flow, and deployment topology. |
| [`backend`](backend/README.md) | Express REST API, Binance integrations, and the local WebSocket gateway. |
| [`frontend`](frontend/README.md) | React application flow, charting, indicators, and frontend development. |
| [`adrs`](adrs/README.md) | Architecture Decision Records. |

## Start here

- New contributor: read the [architecture overview](architecture/README.md), then the [backend](backend/README.md) and [frontend](frontend/README.md) guides.
- Technical decision: check the [ADR index](adrs/README.md).
- Local setup: follow the commands in the root [README](../README.md).

## Documentation rules

- Put architecture and runtime behavior in `architecture/`.
- Put service-specific behavior in `backend/` or `frontend/`; application source lives in `apps/`.
- Put reusable workspace packages in `packages/` only when at least two applications share the code.
- Put one accepted, rejected, or superseded technical decision in each file under `adrs/`.
- Link to source files when a detail is controlled by code.
- State limits and assumptions instead of describing unverified future behavior.