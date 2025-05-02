import postgresPlugin from "@neondatabase/vite-plugin-postgres";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [postgresPlugin(), react()],
});
