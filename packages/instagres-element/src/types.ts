import "solid-js";

export interface InstagresElementProps {
	url: string;
	expiresAt: string;
}

export interface InstagresElementHTMLAttributes {
	url?: string;
	expiresAt?: string;
}

declare module "solid-js" {
	namespace JSX {
		interface IntrinsicElements {
			"instagres-element": InstagresElementProps &
				JSX.HTMLAttributes<HTMLElement>;
		}
	}
}

declare module "react" {
	namespace JSX {
		interface IntrinsicElements {
			"instagres-element": InstagresElementProps;
		}
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"instagres-element": InstagresElementHTMLAttributes;
		}
	}
}
