# neon-init

Set up Neon's MCP Server for AI-powered database operations in VS Code and Cursor.

## Installation

```sh
npm add neon-init
```

## Usage

```ts
import { init } from "neon-init";

await init();
```

Or via CLI:

```sh
npx neon-init
```

Then:

1. Restart your editor (VS Code or Cursor)
2. Type **"Get started with Neon using MCP Resource"** in your AI chat

## What It Does

### Configures Neon MCP Server

-   **Cursor**: Creates `~/.cursor/mcp.json` (global config - works across all projects)
-   **VS Code**: Creates global `mcp.json` if VS Code is installed, otherwise falls back to `.vscode/mcp.json` (workspace config)

**Supported Editors:**

-   **VS Code** with GitHub Copilot
-   **Cursor**

The tool automatically detects which editors are installed on your system but you'll be prompted to choose which one(s) to configure.

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
