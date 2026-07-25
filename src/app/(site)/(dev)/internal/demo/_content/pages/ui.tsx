"use client";

import { OverviewLinks } from "../OverviewLinks";
import type { DemoPage } from "../types";

export const uiDemoPage: DemoPage = {
	id: "ui",
	slug: ["ui"],
	title: "UI Overview",
	description: "Core UI system areas",
	groups: [
		{
			id: "ui-links",
			title: "UI Sections",
			description: "Jump to a UI category",
			items: [
				{
					id: "ui-links-card",
					kind: "component",
					name: "UI Links",
					label: "Quick navigation",
					Render() {
						return (
							<OverviewLinks
								links={[
									{
										href: "/internal/demo/ui/primitives",
										label: "Primitives",
									},
									{ href: "/internal/demo/ui/helpers", label: "Helpers" },
									{ href: "/internal/demo/ui/icons", label: "Icons" },
									{ href: "/internal/demo/ui/input", label: "Input" },
									{ href: "/internal/demo/ui/misc", label: "Misc" },
									{ href: "/internal/demo/ui/motion", label: "Motion" },
									{ href: "/internal/demo/ui/overlays", label: "Overlays" },
									{ href: "/internal/demo/ui/time", label: "Time" },
									{
										href: "/internal/demo/ui/foundations",
										label: "Foundations",
									},
								]}
							/>
						);
					},
				},
			],
		},
	],
};
