import { log } from "@clack/prompts";

export function getPoolerString(connString: string) {
	const [start, ...end] = connString.split(".");
	return `${start}-pooler.${end.join(".")}`;
}
