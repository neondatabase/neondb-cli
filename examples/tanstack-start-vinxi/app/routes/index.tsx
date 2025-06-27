import { createFileRoute } from "@tanstack/react-router";
import { getVersion } from "../db/queries";

export const Route = createFileRoute("/")({
	component: Home,
	loader: async () => await getVersion(),
});

function Home() {
	const state = Route.useLoaderData();

	return <p>version is: {state}</p>;
}
