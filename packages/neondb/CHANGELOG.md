# neondb

## 0.9.1

### Patch Changes

- 390b2ac: update feedback message so it says `get-db` instead of `neondb`
- Updated dependencies [390b2ac]
  - get-db@0.9.1

## 0.9.0

### Minor Changes

- 759488b: New minor release for deprecation logs and new names

### Patch Changes

- Updated dependencies [759488b]
  - get-db@0.9.0

## 0.8.2

### Patch Changes

- 9978eb4: Fix existing settings check.

  - Env preparation was wrongfully checking only for default variable and file name.
  - `--yes` flag was supressing other flags. Now it's possible to override promptless path.

## 0.8.1

### Patch Changes

- ba1f576: Fix bad rebase on docs

## 0.8.0

### Minor Changes

- 9ad30b8: Adds `claim` command

  - This command opens the browser in the Claim URL directly.
  - Adds a new environment variable with such Claim URL to be consumed by the client-side as well (useful for templates).

  ## neondb cli

  default is `PUBLIC_`

  ## vite-plugin-postgres

  default is `VITE_`

- 4ac5175: No more CAPTCHAs

  We have removed Cloudflare Turnstile Bot protection from our system.
  This unlocks a completely non-interactive flow to create new databases in Launchpad 🎉

### Patch Changes

- bf6ec47: Adjust messaging, add `--yes` tip on prompt

## 0.7.2

### Patch Changes

- aa69f87: Fix `--yes` flag suppressing `--seed` flag

## 0.7.1

### Patch Changes

- 6b382d1: Fix `--seed` CLI flag

  A bug was causing the `-s` flag to be ignored and the `--seed` to throw an exception (because the CLI expected `--sql` instead).

## 0.7.0

### Minor Changes

- 8ae511e: Add support for seeding a SQL script during database initialization. You can now provide a path to a SQL file that will be executed right after the database is created. Either via the prompt or with a command flag.

  | Option       | Description                                         |
  | ------------ | --------------------------------------------------- |
  | `-s, --seed` | Path to SQL file to execute after database creation |

## 0.6.3

### Patch Changes

- ce1c182: Add better referrer values for each package

## 0.6.2

### Patch Changes

- 9e8a5a4: Fix Unclaimed project Time-to-Live (TTL)

  The actual TTL of an unclaimed branch is 72 hours

## 0.6.1

### Patch Changes

- 995ad06: Fix Neon domain and add keywords to `package.json`

## 0.6.0

### Minor Changes

- b807e80: Adds validation to user input on file name and environment variable key.

  | Option     | Default        | Description               | Validation            |
  | ---------- | -------------- | ------------------------- | --------------------- |
  | dotEnvFile | ".env"         | Path to env file          | letters and `.`       |
  | dotEnvKey  | "DATABASE_URL" | Environment variable name | `SCREAMING_SNAKE_CASE |

- b807e80: Prevents creating a DB if flow is cancelled

  if the user aborts (CTRL+C), the CLI will not use the defaults and the process will be interrupted immediately.

### Patch Changes

- 31cb6f4: Remove `refferer`, `provider`, and `region` from possible CLI arguments
- adbfcc9: Fix: prevent flags from being ignored

  This release fixes a regression where `--env` and `--key` flags were being ignored and defaults would be used regardless.

## 0.5.0

### Minor Changes

- e3482a6: Fixed new lines being added in the .env file

## 0.4.1

### Patch Changes

- 91c6b5f: Remove trailing whitespace from `.env`

## 0.4.0

### Minor Changes

- e09a8c8: Improve logs

  - Generate better logs for the CLI.
  - Add proper Claim URL to the `.env`.
  - Remove excess tabs from the `.env` output.

## 0.3.1

### Patch Changes

- 11e28a5: Update endpoints

## 0.3.0

### Minor Changes

- 05de2a7: Add `/sdk` export for `instantNeon`

## 0.2.1

### Patch Changes

- a0817d9: Append the defaults to the prompt messages.
