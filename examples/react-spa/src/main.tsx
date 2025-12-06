import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "instagres-element";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
		<instagres-element />
	</StrictMode>
);
