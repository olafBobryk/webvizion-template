"use client";

import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { useIconRegistry } from "@/components/ui/icons/iconRegistry";
import { Panel } from "@/components/ui/primitives/Panel";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiIconsDemoPage: DemoPage = {
	id: "ui-icons",
	slug: ["ui", "icons"],
	title: "UI Icons",
	description: "Glyphs + registry",
	groups: [
		{
			id: "ui-icons-core",
			title: "Icons",
			description: "Glyphs + icon utilities",
			items: [
				{
					id: "icon",
					kind: "component",
					name: "Icon",
					label: "Named icon glyph",
					related: relatedMap.Icon,
					Render() {
						const registry = useIconRegistry();
						const iconNames = Object.keys(registry).sort();

						return (
							<div className="flex flex-col gap-4">
								<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
									{iconNames.map((name) => (
										<Panel
											key={name}
											background="background"
											border="subtle"
											display="block"
											padding="xs"
											radius="sm"
											shadow="none"
										>
											<div className="flex items-center gap-3">
												<Icon name={name as IconName} size="md" />
												<span className="text-2xs font-medium text-foreground/70">
													{name}
												</span>
											</div>
										</Panel>
									))}
								</div>
								<div className="flex flex-wrap gap-2">
									<Panel
										background="background"
										border="subtle"
										display="block"
										padding="xs"
										radius="sm"
										shadow="none"
									>
										<div className="flex items-center gap-3">
											<Icon name="arrow-right" size="md" mirrorInRtl />
											<span className="text-2xs font-medium text-foreground/70">
												LTR mirrored icon
											</span>
										</div>
									</Panel>
									<Panel
										dir="rtl"
										background="background"
										border="subtle"
										display="block"
										padding="xs"
										radius="sm"
										shadow="none"
									>
										<div className="flex items-center gap-3">
											<Icon name="arrow-right" size="md" mirrorInRtl />
											<span className="text-2xs font-medium text-foreground/70">
												RTL mirrored icon
											</span>
										</div>
									</Panel>
								</div>
							</div>
						);
					},
				},
			],
		},
	],
};
