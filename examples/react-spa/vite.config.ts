import postgresPlugin from "@neondatabase/vite-plugin-postgres";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		postgresPlugin({
			/**
			 * @todo
			 * [IMPORTANT] This helps us understand where DB creations on Neon come from.
			 * Please change this as soon as you can, to add your project name:
			 *
			 * @example
			 * ""github:org/your-repo"
			 * "npm:your-package"
			 */
			referrer: "github:neondatabase/neondb/react-spa",
		}),
		react(),
	],
});
