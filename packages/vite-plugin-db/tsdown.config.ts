import { defineConfig } from "tsdown";

export default defineConfig({
	name: "vite-plugin-db",
	bundle: false,
	clean: true,
	dts: true,
	entry: ["src/**/*.ts", "!src/**/*.test.*"],
	format: "esm",
	outDir: "dist",
	treeshake: true,
});
