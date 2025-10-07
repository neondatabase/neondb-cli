# neon-init

Initialize Neon projects with instant Postgres database provisioning.

## Installation

```sh
npm add neon-init
```

## Usage

Import and call the `init()` function to initialize your Neon project:

```ts
import { init } from "neon-init";

init();
```

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
