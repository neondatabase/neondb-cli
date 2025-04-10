#!/usr/bin/env node

import { intro, outro } from "@clack/prompts";
import { cristal } from "gradient-string";
import { LOGO_LETTERING } from "./lib/art.js";

function main() {
	console.log(cristal(LOGO_LETTERING));
	intro("Building something cool...");
	outro("⭐ and 👀 at github.com/neondatabase/neondb");
}

main();
