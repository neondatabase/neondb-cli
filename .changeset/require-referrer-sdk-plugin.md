---
"get-db": minor
"neondb": minor
"vite-plugin-db": minor
"@neondatabase/vite-plugin-postgres": minor
---

**BREAKING CHANGE**: `referrer` parameter is now required for SDK/library and Vite plugin usage. CLI usage is unchanged and maintains default value.

## Breaking Changes

- **SDK/Library (get-db)**: The `referrer` parameter in `instantPostgres()` is now required
- **Vite Plugin (vite-plugin-db)**: The `referrer` option in plugin configuration is now required
- **CLI**: No changes - the `--ref` flag remains optional with default value `npm:get-db/cli`

## Migration Guide

### For SDK/Library Users

```typescript
// Before (v2.x)
await instantPostgres({ dotEnvFile: ".env" });

// After (v3.x)
await instantPostgres({
  referrer: "npm:your-package-name", // REQUIRED
  dotEnvFile: ".env"
});
```

### For Vite Plugin Users

```typescript
// Before (v2.x)
postgres()

// After (v3.x)
postgres({ referrer: "github:username/repo-name" }) // REQUIRED
```

### For CLI Users

✅ No changes needed - the CLI still has a default referrer value.

## Why This Change

The `referrer` parameter is essential for tracking in the Instagres Affiliates Program. By requiring it for SDK and plugin users (who integrate get-db into their own tools), we ensure accurate attribution while maintaining convenience for direct CLI users.
