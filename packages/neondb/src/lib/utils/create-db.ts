import open from "open";
import pWaitFor from "p-wait-for";
import { LAUNCHPAD_URLS } from "./urls.js";

export async function createClaimableDatabase(dbId: string, launchpadUrl: URL) {
	void open(launchpadUrl.href);

	const connString = await pWaitFor<string>(
		async () => {
			const apiUrl = LAUNCHPAD_URLS.GET_DATABASE_DATA(dbId);
			const res = await fetch(apiUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!res.ok) return false;
			return pWaitFor.resolveWith(
				((await res.json()) as { connection_string: string })
					.connection_string,
			);
		},
		{ before: false, interval: 2000 },
	);

	return connString;
}
