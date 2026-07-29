import { applicationSurfaces } from "./application.mjs";
import { devToolSurfaces } from "./dev-tools.mjs";
import { marketingSurface } from "./marketing.mjs";
import { payloadSurface } from "./payload.mjs";

export const templateSurfaces = {
	...applicationSurfaces,
	...marketingSurface,
	...devToolSurfaces,
	...payloadSurface,
};
