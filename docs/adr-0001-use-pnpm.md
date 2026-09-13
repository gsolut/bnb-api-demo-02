# ADR 0001: Use pnpm as the package manager

**Status:** Accepted

## Context

The project is a Node.js based API demo. Several package managers are available (npm, yarn, pnpm). We need a reliable, fast, and space‑efficient solution for managing dependencies.

## Decision

We will use **pnpm** as the default package manager.

## Rationale

* **Performance** – pnpm installs packages significantly faster due to a content‑addressable store.
* **Disk usage** – pnpm stores a single copy of each package version, reducing duplication across workspaces.
* **Workspaces support** – pnpm natively supports monorepo workspaces, which aligns with future scaling plans.
* **Compatibility** – Works with the existing `package.json` format and the Node.js version managed via `nvm`.

## Consequences

* Developers must have pnpm installed globally (`pnpm install -g pnpm`).
* CI/CD scripts need to invoke `pnpm install` instead of `npm install`.
* Documentation must reflect the use of pnpm for onboarding.

---

*Created on 2026‑09‑13*
