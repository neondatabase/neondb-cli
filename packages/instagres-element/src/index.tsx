import { customElement } from "solid-element";
import { createSignal, onCleanup, onMount } from "solid-js";
import styles from "./styles.css?inline";
import type { InstagresElementProps } from "./types.ts";

const HOURS_72 = 72 * 60 * 60 * 1000;

export function useCountdownToFutureDate(targetDate: string | Date) {
	const parseTarget = () =>
		targetDate instanceof Date
			? targetDate.getTime()
			: new Date(targetDate).getTime();
	const getSecondsRemaining = () => {
		const now = Date.now();
		const target = parseTarget();
		const diff = Math.floor((target - now) / 1000);
		return diff > 0 ? diff : 0;
	};
	const [seconds, setSeconds] = createSignal(getSecondsRemaining());

	const formattedSeconds = () => {
		// days, hours, minutes, seconds
		const days = Math.floor(seconds() / 86400);
		const hours = Math.floor((seconds() % 86400) / 3600);
		const minutes = Math.floor((seconds() % 3600) / 60);
		const secs = seconds() % 60;

		return `${days}d ${hours}h ${minutes}m ${secs}s`;
	};

	let interval: NodeJS.Timeout | number;

	onMount(() => {
		interval = setInterval(() => {
			const next = getSecondsRemaining();
			setSeconds(next);
			// Auto-clear timer if reached 0
			if (next === 0 && interval) clearInterval(interval);
		}, 1000);
	});

	onCleanup(() => {
		if (interval) clearInterval(interval);
	});

	return formattedSeconds;
}

export type { InstagresElementProps } from "./types.ts";

export const InstagresElement = customElement<InstagresElementProps>(
	"instagres-element",
	{
		url: "https://instagres.com",
		expiresAt: new Date(Date.now() + HOURS_72).toISOString(),
	},
	(props) => {
		const secondsRemaining = useCountdownToFutureDate(props.expiresAt);
		const [isHovered, setIsHovered] = createSignal(false);

		return (
			<>
				<style>{styles}</style>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: <> */}
				<div
					class="wrapper"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<ellipse cx="12" cy="5" rx="9" ry="3" />
						<path d="M3 5V19A9 3 0 0 0 21 19V5" />
						<path d="M3 12A9 3 0 0 0 21 12" />
					</svg>
					<div
						classList={{
							"wrapper-content": true,
							inactive: !isHovered(),
						}}
					>
						<span>
							Postgres instance expires in {secondsRemaining()}.
						</span>
						<a href={props.url} target="_blank">
							claim it now
						</a>
					</div>
				</div>
			</>
		);
	},
);
