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
  - vite-plugin-db@0.5.0

## 0.4.5

### Patch Changes

- 52a24df: The referrer flag is important for the **Instagres Affiliates Program**.
  People building templates or spinning apps that connect to an Instagres db can receive payouts based on their usage.

  ***

  This PR adds back support to the `--ref` / `-ref` flag to the CLI. And ensures encoding is properly done.
  It also adds thorough test coverage to this functionality to ensure payouts land without fault.

- Updated dependencies [52a24df]
  - vite-plugin-db@0.4.5

## 0.4.4

### Patch Changes

- 65e1130: Rename variables to Instagres related names
- Updated dependencies [65e1130]
  - vite-plugin-db@0.4.4

## 0.4.3

### Patch Changes

- d91f813: Refactor: Rename `instantNeon` to `instantPostgres`.
  Fix: allow `instantPostgres` to receive no parameters.
- Updated dependencies [d91f813]
  - vite-plugin-db@0.4.3

## 0.4.2

### Patch Changes

- vite-plugin-db@0.4.2

## 0.4.1

### Patch Changes

- vite-plugin-db@0.4.1

## 0.4.0

### Minor Changes

- 759488b: New minor release for deprecation logs and new names

### Patch Changes

- Updated dependencies [759488b]
  - vite-plugin-db@0.4.0
