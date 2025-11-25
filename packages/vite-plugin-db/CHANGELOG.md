# @neondatabase/vite-plugin-postgres

## 0.5.0

### Minor Changes

- 0b91135: **Make pooler the default connection**

  this change may be perceived as breaking change for some, but it aligns to best practices for Neon databases.

  In prior releases, we wrote the following 3 variables to the env file:

  | Variable                     | Description                      |
  | ---------------------------- | -------------------------------- |
  | `DATABASE_URL`               | the **direct** connection string |
  | `DATABASE_URL_POOLER`        | the pooler connection string     |
  | `PUBLIC_INSTAGRES_CLAIM_URL` | the url to be claimed            |

  From this release onwards, we're aligning on using the **pooler connection string as the default**.

  | Variable                     | Description                      |
  | ---------------------------- | -------------------------------- |
  | `DATABASE_URL`               | the **pooler** connection string |
  | `DATABASE_URL_DIRECT`        | the direct connection string     |
  | `PUBLIC_INSTAGRES_CLAIM_URL` | the url to be claimed            |

### Patch Changes

- Updated dependencies [0b91135]
  - get-db@0.11.0

## 0.4.5

### Patch Changes

- 52a24df: The referrer flag is important for the **Instagres Affiliates Program**.
  People building templates or spinning apps that connect to an Instagres db can receive payouts based on their usage.

  ***

  This PR adds back support to the `--ref` / `-ref` flag to the CLI. And ensures encoding is properly done.
  It also adds thorough test coverage to this functionality to ensure payouts land without fault.

- Updated dependencies [52a24df]
  - get-db@0.10.0

## 0.4.4

### Patch Changes

- 65e1130: Rename variables to Instagres related names
- Updated dependencies [65e1130]
  - get-db@0.9.4

## 0.4.3

### Patch Changes

- d91f813: Refactor: Rename `instantNeon` to `instantPostgres`.
  Fix: allow `instantPostgres` to receive no parameters.
- Updated dependencies [d91f813]
- Updated dependencies [d9e78d5]
  - get-db@0.9.3

## 0.4.2

### Patch Changes

- Updated dependencies [7b894b4]
  - get-db@0.9.2

## 0.4.1

### Patch Changes

- Updated dependencies [390b2ac]
  - get-db@0.9.1

## 0.4.0

### Minor Changes

- 759488b: New minor release for deprecation logs and new names

### Patch Changes

- Updated dependencies [759488b]
  - get-db@0.9.0

## 0.3.2

### Patch Changes

- 9978eb4: Fix existing settings check.

  - Env preparation was wrongfully checking only for default variable and file name.
  - `--yes` flag was supressing other flags. Now it's possible to override promptless path.

- Updated dependencies [9978eb4]
  - neondb@0.8.2

## 0.3.1

### Patch Changes

- Updated dependencies [ba1f576]
  - neondb@0.8.1

## 0.3.0

### Minor Changes

- f4f6621: Add named export, deprecate default export
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

- 45937cb: Allow Vite 7
- bf6ec47: Make logs more discrete on Vite-Plugin output
- Updated dependencies [9ad30b8]
- Updated dependencies [bf6ec47]
- Updated dependencies [4ac5175]
  - neondb@0.8.0

## 0.2.3

### Patch Changes

- Updated dependencies [aa69f87]
  - neondb@0.7.2

## 0.2.2

### Patch Changes

- 0617e0a: Make sure the `postgresPlugin` runs first

  adds `enforce:pre` to plugin configuration so it runs before everything.
  It's important to run first so the development server plugin does not grab the `.env` before we change it.

## 0.2.1

### Patch Changes

- Updated dependencies [6b382d1]
  - neondb@0.7.1

## 0.2.0

### Minor Changes

- 8ae511e: Add `seed` option to seed database with SQL script on initialization. This option accepts a path to a SQL file that will be executed after the database is created.

### Patch Changes

- Updated dependencies [8ae511e]
  - neondb@0.7.0

## 0.1.5

### Patch Changes

- ce1c182: Add better referrer values for each package
- Updated dependencies [ce1c182]
  - neondb@0.6.3

## 0.1.4

### Patch Changes

- 9e8a5a4: Fix Unclaimed project Time-to-Live (TTL)

  The actual TTL of an unclaimed branch is 72 hours

- Updated dependencies [9e8a5a4]
  - neondb@0.6.2

## 0.1.3

### Patch Changes

- 941e67a: Add `neondb` as a dependency

## 0.1.2

### Patch Changes

- 995ad06: Fix Neon domain and add keywords to `package.json`

## 0.1.1

### Patch Changes

- 11e28a5: Update endpoints

## 0.1.0

### Minor Changes

- 05de2a7: Add basic functionality with `neondb/sdk`
