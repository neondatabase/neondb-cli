#!/usr/bin/env node

import { intro, outro } from "@clack/prompts";
import { LOGO_LETTERING } from "./lib/art.js";
import { cristal } from "gradient-string";

function main() {
	console.log(cristal(LOGO_LETTERING));
	intro("Building something cool...");
	outro(`⭐ and 👀 at github.com/neondatabase/neondb`);
}

main();
