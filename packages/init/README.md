# neon-init

Set up your project with Neon's MCP Server and AI assistant best practices.

## Installation

```sh
npm add neon-init
```

## Usage

```ts
import { init } from "neon-init";

await init();
```

Then:

1. Restart your AI coding assistant (Cursor, Windsurf, etc.)
2. Type **"Get started with Neon"** in your AI chat

## What It Does

### 1. Configures Neon MCP Server

The CLI will ask which AI assistant(s) you want to configure:

-   **Cursor**: Configures via `~/.cursor/mcp.json`
-   **Claude Code**: Configures via `claude` CLI (requires `claude` to be installed)
-   **Both**: Configure both platforms at once

This enables AI-powered database operations through the Model Context Protocol.

**Authentication:** Uses OAuth via `neonctl` and creates an API key for you - opens your browser, no manual API keys needed.

**Supported Platforms:**

-   Cursor
-   Claude Code (via `claude` CLI)

### 2. Creates AGENTS.md

Adds Neon-specific guidance to `AGENTS.md` (or creates it if it doesn't exist) with:

-   Interactive "Get started with Neon" onboarding flow for AI assistants
-   Security, performance, and schema management best practices
-   Neon-specific features (branching, autoscaling, scale-to-zero)

### 3. Organization Selection

If you have multiple Neon organizations, you'll choose which one to use. The org ID is saved in AGENTS.md so AI assistants know which organization context to use.

## Development

| Command      | Description       |
| ------------ | ----------------- |
| `pnpm build` | Build the package |
| `pnpm test`  | Run the tests     |

### From workspace root

| Command                         | Description       |
| ------------------------------- | ----------------- |
| `pnpm --filter neon-init build` | Build the package |
| `pnpm --filter neon-init test`  | Run the tests     |
