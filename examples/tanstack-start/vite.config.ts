import { postgres } from "@neondatabase/vite-plugin-postgres";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
<<<<<<< HEAD
  plugins: [
    postgres({
      seed: {
        type: "sql-script",
        path: "./db/init.sql",
      },
      referrer: "github:neondatabase/neondb/tanstack-start",
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
  ],
=======
	plugins: [
		postgres({
			seed: {
				type: "sql-script",
				path: "./db/init.sql",
			},
		}),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
	],
>>>>>>> f2f4d0b (feat: add Claim URL as env var and claim command)
});

export default config;
