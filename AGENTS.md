# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for Neon Launchpad packages that provide instant Postgres database provisioning without sign-ups. It contains two main packages:

-   `neondb`: A CLI tool for creating claimable Neon databases
-   `@neondatabase/vite-plugin-postgres`: A Vite plugin that automatically provisions databases

## Development Commands

### Building

```bash
# Build both packages
pnpm build

# Build CLI only
pnpm build:cli

# Build Vite plugin only
pnpm build:plugin
```

### Testing

```bash
# Run all tests
pnpm test:ci

# Run tests for specific package
cd packages/neondb && pnpm test
cd packages/vite-plugin-postgres && pnpm test
```

### Linting & Formatting

```bash
# Format code (uses Biome)
pnpm format

# Run lint checks for CI
pnpm lint:ci
```

### Package Testing

```bash
# Test CLI with prompts
cd packages/neondb && pnpm dry:run:prompt

# Test CLI with defaults
cd packages/neondb && pnpm dry:run
```

## Architecture

### Monorepo Structure

-   Uses pnpm workspaces with two main packages
-   Shared dependencies managed at root level
-   Uses Biome for linting/formatting instead of ESLint/Prettier
-   Uses `tsdown` for TypeScript compilation instead of tsc directly
-   Package manager: pnpm@10.4.0, Node.js >=18.3.0

### neondb Package

-   **Entry points**: CLI (`dist/cli.js`) and SDK exports (`./sdk`, `./launchpad`)
-   **Core functionality**: Creates claimable Neon databases via API calls
-   **CLI options**: `-y/--yes`, `-e/--env`, `-k/--key`, `-s/--seed`, `-h/--help`
-   **Dependencies**: Uses `@clack/prompts` for interactive CLI, `@neondatabase/serverless` for DB operations

### Vite Plugin Package

-   **Purpose**: Automatically provisions databases during Vite development
-   **Behavior**: Checks for DATABASE_URL in .env, creates database if missing, noop in production
-   **Configuration**: Supports custom env file path, env key name, and SQL seeding
-   **Integration**: Must be placed as first plugin in Vite config

### Key Implementation Details

-   Both packages support SQL seeding via `--seed` flag (CLI) or `seed.path` option (plugin)
-   Databases are "claimable" with 7-day expiration URLs
-   Plugin writes both direct and pooled connection strings
-   SDK provides `instantNeon()` function for programmatic usage
-   Uses TypeScript with strict configuration
-   All packages use ESM modules (`"type": "module"`)

### Development Patterns

-   Uses Changesets for version management (`pnpm bump`)
-   Husky for git hooks with lint-staged
-   Vitest for testing with `--passWithNoTests`
-   TypeScript compilation with `tsc --noEmit` before bundling
