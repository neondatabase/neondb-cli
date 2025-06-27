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
				/**
				 * @todo
				 * [IMPORTANT] This helps us understand where DB creations on Neon come from.
				 * Please change this as soon as you can, to add your project name:
				 *
				 * @example
				 * ""github:org/your-repo"
				 * "npm:your-package"
				 */
				referrer: "github:neondatabase/neondb/tanstack-start",
			}),
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
		],
	},
});
