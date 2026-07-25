"use client";

import { OverviewLinks } from "../OverviewLinks";
import type { DemoPage } from "../types";

export const compositesDemoPage: DemoPage = {
	id: "composites",
	slug: ["composites"],
	title: "Composites",
	description: "Reusable components composed from design-system primitives",
	groups: [
		{
			id: "composite-links",
			title: "Composite Components",
			description: "Shared above-primitive components below route shells",
			items: [
				{
					id: "composite-links-card",
					kind: "component",
					name: "Composite Links",
					label: "Jump to component",
					Render() {
						return (
							<OverviewLinks
								links={[
									{
										href: "/internal/demo/composites/markdown",
										label: "Markdown",
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
