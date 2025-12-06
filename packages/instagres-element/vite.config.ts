import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
	plugins: [solid()],
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
