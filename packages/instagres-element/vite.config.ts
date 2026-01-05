import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [
		solid(),
		dts({
			include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"],
			insertTypesEntry: true,
			copyDtsFiles: true,
		}),
	],
	build: {
		lib: {
			entry: "./src/index.tsx",
			name: "InstagresElement",
			fileName: "index",
			formats: ["es"],
		},
		outDir: "dist",
		emptyOutDir: true,
		rollupOptions: {
			external: [],
		},
	},
});
