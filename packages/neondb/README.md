<h1 align="center">Neondb</h1>

<p align="center">CLI to help you hit the ground running without any sign-up. Instantiate a database with a single-command!</p>

## Usage

```shell
npx neondb
```

---

## CLI Usage

```sh
npx neondb [options]
```

Options:

-   `-y, --yes` Use defaults, skip prompts
-   `-e, --env` Path to .env file (default: ./.env)
-   `-k, --key` Env key for connection string (default: DATABASE_URL)
-   `-s, --seed` Path to SQL file to execute after database creation
-   `-h, --help` Show help

---

## SDK/API Usage

Import the SDK:

```ts
import { instantNeon } from "neondb/sdk";
```

Create a claimable Neon Postgres database and save credentials to your .env:

```ts
await instantNeon({
	dotEnvFile: ".env",
	dotEnvKey: "DATABASE_URL",
	// This below is to help us understand where usage comes from.
	// If you're publishing a library, we'd love that you re-expose a
	// referrer parameter in your lib and set this to `npm:your-lib-package-name|${referrer}`
	// So we can understand the chain better and give you all the credit you deserve!
	referrer: "npm:your-cli-package-name",
});
```

| Option     | Default        | Description               | Validation            |
| ---------- | -------------- | ------------------------- | --------------------- |
| dotEnvFile | ".env"         | Path to env file          | letters and `.`       |
| dotEnvKey  | "DATABASE_URL" | Environment variable name | `SCREAMING_SNAKE_CASE |
| referrer   | "unknown"      | Referrer identifier       | -                     |

Returns:

| Property         | Description              |
| ---------------- | ------------------------ |
| `databaseUrl`    | connection string        |
| `poolerUrl`      | pooled connection string |
| `claimUrl`       | claim link               |
| `claimExpiresAt` | expiration date          |

---

## Types

```ts
// Params for instantNeon
interface InstantNeonParams {
	dotEnvFile?: string;
	dotEnvKey?: string;
	referrer?: string;
}
```

> See [documentation on Neon](https://neon.com/docs/reference/neon-launchpad) for more.

---

This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo engine](https://create.bingo).
