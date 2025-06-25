# Vite-Plugin-Postgres by Neon

This Vite plugin instantly provisions a Postgres instance (via Neon) and injects the connection string into your `.env` file, so you can start developing immediately.

## How it works

-   On first `vite dev`, the plugin checks for a `DATABASE_URL` (or your configured key) in your `.env`.
-   If not found, it creates a claimable Neon database and writes the connection string to your `.env`.
-   The plugin is a noop in production builds.

## Installation

```sh
npm add @neondatabase/vite-plugin-postgres
```

## Usage

Add the plugin as the first entry in your Vite config:

```ts
import postgresPlugin from "@neondatabase/vite-plugin-postgres";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [postgresPlugin(), react()],
});
```

## Configuration

You can pass an options object to customize the `.env` file path, the environment variable name, and database seeding:

```ts
postgresPlugin({
	env: ".env.local", // Path to your .env file (default: ".env")
	envKey: "DATABASE_URL", // Name of the env variable (default: "DATABASE_URL")
	onCreate: {
		type: "sql-script",
		path: "./schema.sql", // Path to SQL file to execute after database creation
	},
});
```

| Option     | Type   | Description                            | Default        |
| ---------- | ------ | -------------------------------------- | -------------- |
| `env`      | string | Path to the `.env` file                | `.env`         |
| `envKey`   | string | Name of the environment variable       | `DATABASE_URL` |
| `onCreate` | object | Configuration for seeding the database | -              |

### onCreate Options

| Property | Type   | Description                                     | Default |
| -------- | ------ | ----------------------------------------------- | ------- |
| `type`   | string | Type of seeding (currently only `"sql-script"`) | -       |
| `path`   | string | Path to SQL file to execute after creation      | -       |

## What gets written

-   The plugin writes both a direct connection string and a pooled connection string to your `.env`.
-   It also provides a claim URL (valid for 7 days) to take ownership of the database.
-   If `onCreate` is configured, the specified SQL script will be executed after database creation.

## Type Definitions

```ts
interface PostgresPluginOptions {
	env: string; // Path to the .env file
	envKey: string; // Name of the environment variable
	onCreate?: {
		type: "sql-script";
		path: string;
	};
}
```

---

## FAQ

<details>
<summary>What if I already have a <code>DATABASE_URL</code> env var?</summary>
 
The plugin will not overwrite it. Remove the variable if you want to generate a new Neon database.

</details>

<details>
<summary>Is this safe to run on CI when building for production?</summary>

The plugin is a noop in production mode (`vite build`), so it won't create databases or modify your `.env` in CI.

</details>

<details>
<summary>Can I use this with other frameworks?</summary>

Yes, this plugin is framework-agnostic. The example uses React, but you can use it with any Vite-compatible framework.
</sumamry>

## Advanced

If you want to generate claimable databases outside of Vite, use the [`neondb`](https://github.com/neondatabase/neondb-cli/tree/main/packages/neondb) library directly.

> See [documentation on Neon](https://neon.com/docs/reference/neon-launchpad) for more.
