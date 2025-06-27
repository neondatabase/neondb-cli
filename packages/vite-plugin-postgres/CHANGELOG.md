# @neondatabase/vite-plugin-postgres

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
