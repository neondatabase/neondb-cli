import { defineConfig } from "tsdown";

export default defineConfig({
	name: "neon-init",
	bundle: false,
	clean: true,
	dts: true,
	entry: ["src/index.ts", "src/**/*.ts", "!src/**/*.test.*"],
	format: "esm",
	outDir: "dist",
	treeshake: true,
});
