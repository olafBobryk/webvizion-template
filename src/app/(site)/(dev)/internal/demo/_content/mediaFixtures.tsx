"use client";

import type { ReactNode } from "react";
import type { ImageSwitcherImage } from "@/components/ui/misc";
import { Panel } from "@/components/ui/primitives/Panel";

export const imageSwitcherDemoImages = [
	{
		src: "/test/mercury.png",
		alt: "Mercury-like abstract surface",
		blurDataURL:
			"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyMCAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIGZpbGw9IiNkOGQ4ZDAiLz48Y2lyY2xlIGN4PSIxNCIgY3k9IjYiIHI9IjUiIGZpbGw9IiNhZWE4OTgiLz48L3N2Zz4=",
	},
	{
		src: "/test/blob.png",
		alt: "Soft abstract blob",
		blurDataURL:
			"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyMCAxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIGZpbGw9IiNmMWY1ZjkiLz48Y2lyY2xlIGN4PSI4IiBjeT0iNiIgcj0iNSIgZmlsbD0iIzk0YTNmNyIvPjwvc3ZnPg==",
	},
] satisfies ImageSwitcherImage[];

export function DemoMediaFrame({ children }: { children: ReactNode }) {
	return (
		<Panel
			background="surface"
			border="subtle"
			overflow="hidden"
			padding="none"
			radius="lg"
			shadow="none"
		>
			{children}
		</Panel>
	);
}
