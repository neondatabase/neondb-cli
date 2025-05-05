import postgresPlugin from "@neondatabase/vite-plugin-postgres";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
export default defineConfig({
	vite: {
		plugins: [
			postgresPlugin(),
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
		],
	},
});
