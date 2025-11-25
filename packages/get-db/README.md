<h1 align="center">get-db</h1>

<p align="center">CLI to help you hit the ground running without any sign-up. Instantiate a database with a single-command!</p>

> **Note:** This package was previously named `neondb`. The old package is now deprecated. If you're upgrading from `neondb`, simply replace it with `get-db` in your commands and imports.

## Usage

```shell
npx get-db
```

---

## CLI Usage

The CLI provides a default referrer value, so the `--ref` flag is optional.

```sh
npx get-db [options]
```

Options:

-   `-y, --yes` Use defaults, skip prompts
-   `-e, --env` Path to .env file (default: ./.env)
-   `-k, --key` Env key for connection string (default: DATABASE_URL)
-   `-p, --prefix` Prefix for public env vars (default: PUBLIC\_)
-   `-r, --ref` Referrer identifier for tracking (default: npm:get-db/cli)
-   `-s, --seed` Path to SQL file to execute after database creation
-   `-h, --help` Show help

---

## SDK/API Usage

> ⚠️ **BREAKING CHANGE in v3.0.0**: The `referrer` parameter is now **required** when using the SDK.

Import the SDK:

```ts
import { instantNeon } from "get-db/sdk";
```

Create a claimable Neon Postgres database and save credentials to your .env:

```ts
await instantNeon({
	referrer: "npm:your-cli-package-name", // REQUIRED
	dotEnvFile: ".env",
	dotEnvKey: "DATABASE_URL",
	envPrefix: "PUBLIC_",
	// This referrer parameter helps us understand where usage comes from.
	// If you're publishing a library, we'd love that you re-expose a
	// referrer parameter in your lib and set this to `npm:your-lib-package-name|${referrer}`
	// So we can understand the chain better and give you all the credit you deserve!
});
```

| Option     | Default        | Description                        | Required | Validation            |
| ---------- | -------------- | ---------------------------------- | -------- | --------------------- |
| referrer   | -              | Referrer identifier                | ✅ Yes   | -                     |
| dotEnvFile | ".env"         | Path to env file                   | No       | letters and `.`       |
| dotEnvKey  | "DATABASE_URL" | Environment variable name          | No       | `SCREAMING_SNAKE_CASE |
| envPrefix  | "PUBLIC\_"     | Prefix for public environment vars | No       | -                     |

> **Note**: The Vite plugin uses `VITE_` as the default `envPrefix` to match Vite's convention for client-side environment variables.

Returns:

| Property         | Description              |
| ---------------- | ------------------------ |
| `databaseUrl`    | connection string        |
| `poolerUrl`      | pooled connection string |
| `claimUrl`       | claim link               |
| `claimExpiresAt` | expiration date          |

### Environment Variables Written

When you run `get-db`, the following environment variables are written to your `.env` file:

| Variable                           | Description                                                |
| ---------------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`                     | The **pooler** connection string (default connection)      |
| `DATABASE_URL_DIRECT`              | The direct connection string                               |
| `{envPrefix}INSTAGRES_CLAIM_URL`   | Claim URL (valid for 7 days) to take ownership of the DB  |

> **Note:** The pooler connection is now the default for `DATABASE_URL` (as of the latest version). The pooler provides connection pooling and is recommended for most use cases, especially serverless environments.

---

## Types

```ts
// Params for instantNeon
interface InstantNeonParams {
	referrer: string; // Required
	dotEnvFile?: string;
	dotEnvKey?: string;
	envPrefix?: string;
}
```

> See [documentation on Neon](https://neon.com/docs/reference/neon-launchpad) for more.

---

This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo engine](https://create.bingo).
