import { customElement } from "solid-element";
import { createSignal, onCleanup, onMount } from "solid-js";
import styles from "./styles.css?inline";
import type { InstagresElementProps } from "./types.ts";

export const InstagresElement = customElement<InstagresElementProps>(
	"instagres-element",
	{
		url: "https://instagres.com",
		expiresAt: new Date(
			Date.now() + 1000 * 60 * 60 * 24 * 30,
		).toISOString(),
	},
	(props) => {
		let interval: NodeJS.Timeout | number;
		const [expirationDate, setExpirationDate] = createSignal(
			props.expiresAt,
		);
		onMount(() => {
			interval = setInterval(() => {
				setExpirationDate(
					new Date(
						Date.now() + 1000 * 60 * 60 * 24 * 30,
					).toISOString(),
				);
			}, 1000);
		});
		onCleanup(() => {
			clearInterval(interval);
		});
		return (
			<>
				<style>{styles}</style>
				<div id="instagres-element">
					<h1 part="heading">Instagres Element</h1>
					<p style={{ color: "lavender" }}>URL: {props.url}</p>
					<p style={{ color: "hotpink" }}>
						Expires At: {expirationDate()}
					</p>
				</div>
			</>
		);
	},
);
