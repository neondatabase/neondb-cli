# neon-init

Set up your project with Neon's MCP Server for AI-powered database operations.

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
2. Type **"Get started with Neon using MCP Resource"** in your AI chat

## What It Does

### Configures Neon MCP Server

Creates `~/.cursor/mcp.json` (global config) to enable AI-powered database operations through the Model Context Protocol.

**Authentication:** Uses OAuth via `neonctl` and creates an API key for you - opens your browser, no manual API keys needed.

**Agent Guidelines:** The Neon MCP Server includes built-in agent guidelines as an MCP resource. Your AI assistant will automatically have access to:

-   Interactive "Get started with Neon" onboarding flow
-   Security, performance, and schema management best practices
-   Neon-specific features (branching, autoscaling, scale-to-zero)

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
