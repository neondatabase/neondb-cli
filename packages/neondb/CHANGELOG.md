# neondb

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
