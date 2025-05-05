<h1 align="center">Neon Vite Plugin</h1>

This is a Vite plugin to get you immediately up and running with a fresh Postgres instance, powered by Neon.

## How it works

1. When first running `vite dev` the plugin will inspect the `.env` file, either in the root of your repository or in the specificied path.
2. It will check the environment variables fro a `DATABASE_URL` (or whatever other name is defined in your configuration).
3. If neither is found, it will create for you a claimable database instance and append the values in the those places.

> [!WARNING]
> This plugin is a noop in production builds to prevent from interrupting your CI or any inadverted consequence.

```sh
npm add @neondatabase/vite-plugin-postgres
```

## Usage

It is recommended to have this plugin being the first running in your codebase.

```ts
import postgresPlugin from "@neondatabase/vite-plugin-postgres";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [postgresPlugin()], react()],
});
```

## Configuration

| key      | description                      | default        |
| -------- | -------------------------------- | -------------- |
| `env`    | path to the `.env` file          | `.env`         |
| `envKey` | name of the environment variable | `DATABASE_URL` |

## What if I'm using Vite?

You can jump into our base library to generate claimable databases, [`neondb`](https://github.com/neondatabase/neondb-cli/tree/main/packages/neondb)

---

> This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo engine](https://create.bingo).
