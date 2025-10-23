import { postgres } from "vite-plugin-db";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		postgres({
			referrer: "github:neondb-cli/examples/react-spa",
		}),
		react(),
	],
});
