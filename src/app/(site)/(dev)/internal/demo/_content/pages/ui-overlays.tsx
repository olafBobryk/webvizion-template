"use client";

import Portal from "@/components/ui/overlays/Portal";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import { OverviewLinks } from "../OverviewLinks";
import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiOverlaysDemoPage: DemoPage = {
	id: "ui-overlays",
	slug: ["ui", "overlays"],
	title: "UI Overlays",
	description: "Portals, modals, toasts",
	groups: [
		{
			id: "overlays",
			title: "Overlays",
			description: "Portals + overlay sections",
			items: [
				{
					id: "overlay-links",
					kind: "component",
					name: "Overlay Links",
					label: "Jump to overlays",
					Render() {
						return (
							<OverviewLinks
								links={[
									{
										href: "/internal/demo/ui/overlays/modal",
										label: "Modal",
									},
									{
										href: "/internal/demo/ui/overlays/toast",
										label: "Toast",
									},
								]}
							/>
						);
					},
				},
				{
					id: "portal",
					kind: "component",
					name: "Portal",
					label: "Portal target",
					related: relatedMap.Portal,
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<Text variant="caption" tone="muted">
									Portal target
								</Text>
								<Panel
									id="portal-demo-target"
									background="surface"
									border="subtle"
									display="block"
									padding="xs"
									radius="sm"
									shadow="none"
									className="min-h-10 border-dashed text-xs text-muted-foreground"
								/>
								<Portal target="portal-demo-target">
									<Text variant="caption" tone="muted">
										Portaled text
									</Text>
								</Portal>
							</div>
						);
					},
				},
			],
		},
	],
};
