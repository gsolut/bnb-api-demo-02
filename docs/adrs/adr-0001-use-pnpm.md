# ADR 0001: Use pnpm workspaces

- Status: Accepted
- Date: 2026-09-13

## Context

The repository contains a root package and separate `backend` and `frontend` packages. Developers and automation need one package manager for installing dependencies and running scripts across those packages. Separate lockfiles make dependency updates and reproducibility harder to manage.

## Decision Drivers

- Install all repository packages from one root command.
- Keep one lockfile for reproducible dependency resolution.
- Run a package script directly or coordinate both packages from the root.
- Avoid introducing a second workspace tool for a Node.js repository.

## Considered Options

### npm workspaces

Provides built-in workspace support, but would replace the repository's existing pnpm workflow and lockfile.

### Yarn workspaces

Provides workspace support, but adds another package manager choice without a repository requirement for it.

### pnpm workspaces

Supports the existing pnpm workflow, shared lockfile, package filters, and root orchestration scripts.

## Decision

Use pnpm for local development, dependency installation, and CI or deployment scripts. Declare `backend` and `frontend` in `pnpm-workspace.yaml` and keep dependency resolution in the root `pnpm-lock.yaml`.

## Decision Outcome

The repository uses pnpm workspaces. Root scripts target packages with `pnpm --filter`, while package manifests remain in their respective directories.

## Consequences

- Run `pnpm install` once from the repository root to install both workspace packages.
- Use root scripts such as `pnpm dev` and `pnpm build`, or target a package with `pnpm --filter bnb-backend ...` or `pnpm --filter bnb-frontend ...`.
- CI and container build instructions must use pnpm rather than npm or yarn.
- Contributors need pnpm installed before running the project commands.

## Confirmation

The decision is implemented by `pnpm-workspace.yaml`, the root scripts in `package.json`, and the root lockfile. Verify it with `pnpm install --lockfile-only`, `pnpm lint`, and `pnpm build` from the repository root.

## References

- [pnpm workspace documentation](https://pnpm.io/workspaces)