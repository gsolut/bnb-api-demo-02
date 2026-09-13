# ADR 0001: Use pnpm as the package manager

- Status: Accepted
- Date: 2026-09-13

## Context

The repository contains a root package and separate `backend` and `frontend` packages. Developers and automation need one package manager for installing dependencies and running scripts across those packages.

## Decision

Use pnpm for local development, dependency installation, and CI or deployment scripts.

## Consequences

- Run `pnpm install` in the root, backend, and frontend package directories as needed.
- Use the existing root scripts, such as `pnpm dev` and `pnpm build`, to coordinate both packages.
- CI and container build instructions must use pnpm rather than npm or yarn.
- Contributors need pnpm installed before running the project commands.

The repository benefits from pnpm's lockfile and workspace-oriented package management. It does not currently declare a pnpm workspace file; the root scripts coordinate the three package directories explicitly.