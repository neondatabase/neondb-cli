import { log } from "@clack/prompts";
import { type ZodError } from "zod/v4";

export function getPoolerString(connString: string) {
	const [start, ...end] = connString.split(".");
	return `${start}-pooler.${end.join(".")}`;
}

export function reportZodIssues(error: ZodError) {
	error.issues.forEach((issue) => {
		log.error(
			issue.message +
				" at " +
				issue.path.reduce<string>(
					(acc, curr: string | number | symbol, index) =>
						acc +
						(typeof curr === "string"
							? index === 0
								? curr
								: `.${curr}`
							: `[${String(curr)}]`),
					"",
				),
		);
	});
}
