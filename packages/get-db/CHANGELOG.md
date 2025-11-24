# get-db

## 0.10.0

### Minor Changes

- 52a24df: The referrer flag is important for the **Instagres Affiliates Program**.
  People building templates or spinning apps that connect to an Instagres db can receive payouts based on their usage.

  ***

  This PR adds back support to the `--ref` / `-ref` flag to the CLI. And ensures encoding is properly done.
  It also adds thorough test coverage to this functionality to ensure payouts land without fault.

## 0.9.4

### Patch Changes

- 65e1130: Rename variables to Instagres related names

## 0.9.3

### Patch Changes

- d91f813: Refactor: Rename `instantNeon` to `instantPostgres`.
  Fix: allow `instantPostgres` to receive no parameters.
- d9e78d5: Rename `instantNeon` to `instantPostgres`
  Add root export `import { instantPostgres } from 'get-db'`
  Rename type `InstantNeonParams` to `InstantPostgresParams`

## 0.9.2

### Patch Changes

- 7b894b4: **Add URL detection to `claim` command**

  `get-db claim` command was unable to detect URLs for custom env_var prefixes.
  Now it accepts an override via the feature-flag, but it will also try to automatically detect the URL if it can't find the default prefix easily.

## 0.9.1

### Patch Changes

- 390b2ac: update feedback message so it says `get-db` instead of `neondb`

## 0.9.0

### Minor Changes

- 759488b: New minor release for deprecation logs and new names
