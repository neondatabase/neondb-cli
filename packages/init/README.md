# neon-init

Set up Neon for AI-powered database operations in VS Code, Cursor, and Claude CLI.

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

1. Restart your editor (VS Code, Cursor, or Claude CLI)
2. Type **"Get started with Neon"** in your AI chat

## What It Does

### For VS Code & Cursor: Installs Neon Local Connect Extension

- Automatically installs the Neon Local Connect extension
- Configures the extension with your API key using the extension's configure command

### For Claude CLI: Configures Neon MCP Server

- Creates or updates `~/.claude.json` (global config - works across all projects)

**Supported Editors:**

- **VS Code** (with Neon Local Connect extension)
- **Cursor** (with Neon Local Connect extension)
- **Claude CLI** (with MCP Server)

The tool automatically detects which editors are installed on your system and you'll be prompted to choose which one(s) to configure.

**Authentication:** Uses OAuth via `neonctl` and creates an API key for you - opens your browser, no manual API keys needed.

**Agent Guidelines:** The Neon integration includes built-in agent guidelines. Your AI assistant will automatically have access to:

- Interactive "Get started with Neon" onboarding flow
- Security, performance, and schema management best practices
- Neon-specific features (branching, autoscaling, scale-to-zero)

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
