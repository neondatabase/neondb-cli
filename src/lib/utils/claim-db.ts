import open from "open";
import pWaitFor from "p-wait-for";
import { INSTANT_NEON_URLS } from "./urls.js";
export async function createClaimableDatabase(dbId: string, claimUrl: URL) {
	void open(claimUrl.href);

	const connString = await pWaitFor<string>(
		async () => {
			const apiUrl = INSTANT_NEON_URLS.API(dbId);
			const res = await fetch(apiUrl);
			if (!res.ok) return false;
			return pWaitFor.resolveWith(
				((await res.json()) as { connectionString: string })
					.connectionString,
			);
		},
		{ before: false, interval: 2000 },
	);

	return connString;
}
