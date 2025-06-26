import postgresPlugin from "@neondatabase/vite-plugin-postgres";
import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
export default defineConfig({
	vite: {
		plugins: [
			postgresPlugin({
				seed: {
					type: "sql-script",
					path: "./schema.sql",
				},
			}),
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
		],
	},
});
