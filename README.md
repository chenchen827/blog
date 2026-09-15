# blog-frontend-monorepo

pnpm + Vite + React + TypeScript + Tailwind CSS v4 monorepo.

## Structure
- apps/blog: blog site
- apps/admin: admin dashboard
- packages/shared: shared types / utils / UI components

## Requirements
- Node.js >= 22
- pnpm (enable via corepack)

## Getting started
Enable pnpm: corepack enable pnpm
Install deps: pnpm install

## Scripts
- pnpm dev: run blog (5173) and admin (5174) in parallel
- pnpm dev:blog: run blog only
- pnpm dev:admin: run admin only
- pnpm build: build all apps
- pnpm typecheck: typecheck all packages

## Deployment

CI/CD and production operations are documented in [docs/deployment.md](./docs/deployment.md).
