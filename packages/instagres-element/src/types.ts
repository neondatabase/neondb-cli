import "solid-js";

export interface InstagresElementProps {
	url: string;
	expiresAt: string;
}

declare module "solid-js" {
	namespace JSX {
		interface IntrinsicElements {
			"instagres-element": InstagresElementProps &
				JSX.HTMLAttributes<HTMLElement>;
		}
	}
}
