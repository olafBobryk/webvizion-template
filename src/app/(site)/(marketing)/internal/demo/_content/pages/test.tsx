"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/Panel";
import { Section } from "@/components/ui/primitives/Section";
import { Text } from "@/components/ui/primitives/Text";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const testDemoPage: DemoPage = {
	id: "test",
	slug: ["test"],
	title: "Test",
	description: "Playground pages for primitive experiments",
	visibility: "dev-only",
	groups: [
		{
			id: "section-background",
			title: "Section Background",
			description: "Compound background slot experiments",
			columns: "grid-cols-1",
			items: [
				{
					id: "section-background-image",
					kind: "component",
					name: "Section.Background",
					label: "Image background",
					related: relatedMap.Section,
					Render() {
						return (
							<Panel
								background="transparent"
								border="subtle"
								overflow="hidden"
								padding="none"
								radius="lg"
								shadow="none"
							>
								<Section
									padding="soft"
									background="surface"
									className="min-h-[240px]"
									innerClassName="flex h-full flex-col justify-between gap-6"
								>
									<Section.Background className="opacity-70">
										<Image
											src="/test/blob.png"
											alt=""
											fill
											className="object-cover"
											aria-hidden={true}
										/>
										<div className="absolute inset-0 bg-linear-to-br from-background/90 via-background/45 to-transparent" />
									</Section.Background>
									<div className="flex max-w-lg flex-col gap-2">
										<Text as="h3" variant="headingMd">
											Full-bleed media behind bounded content
										</Text>
										<Text variant="body" tone="muted">
											The background spans the full section while the copy stays
											inside the normal max-width wrapper.
										</Text>
									</div>
									<div className="flex flex-wrap gap-2">
										<Button variant="primary" size="sm">
											Primary action
										</Button>
										<Button variant="secondary" size="sm">
											Secondary
										</Button>
									</div>
								</Section>
							</Panel>
						);
					},
				},
				{
					id: "section-background-pattern",
					kind: "component",
					name: "Section.Background",
					label: "Decorative gradient + pattern",
					related: relatedMap.Section,
					Render() {
						return (
							<Panel
								background="transparent"
								border="subtle"
								overflow="hidden"
								padding="none"
								radius="lg"
								shadow="none"
							>
								<Section
									padding="soft"
									background="foreground"
									className="min-h-[240px] text-background"
									innerClassName="flex h-full flex-col justify-between gap-6"
									maxWidth="wide"
								>
									<Section.Background className="opacity-80">
										<div className="h-full w-full bg-linear-to-br from-primary/30 via-transparent to-background/10" />
										<div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
										<div className="absolute right-8 top-8 h-24 w-24 rounded-full border border-white/20" />
										<div className="absolute inset-x-0 bottom-0 h-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]" />
									</Section.Background>
									<div className="flex max-w-xl flex-col gap-3">
										<Text
											as="h3"
											variant="headingMd"
											className="text-background"
										>
											Node backgrounds are not limited to images
										</Text>
										<Text variant="body" className="text-background/80">
											Patterns, gradients, ambient shapes, and layered media can
											live behind the section without changing foreground
											layout.
										</Text>
									</div>
									<Panel
										border="subtle"
										display="flex"
										padding="sm"
										gap="sm"
										shadow="none"
										background="transparent"
										className="max-w-md !border-white/15 text-background"
									>
										<Text variant="bodyStrong" className="text-background">
											Same foreground structure
										</Text>
										<Text variant="caption" className="text-background/80">
											The section API still controls spacing and width.
										</Text>
									</Panel>
								</Section>
							</Panel>
						);
					},
				},
				{
					id: "section-background-interactive",
					kind: "component",
					name: "Section.Background",
					label: "Interactive opt-in background",
					related: relatedMap.Section,
					Render() {
						const [taps, setTaps] = useState(0);

						return (
							<Panel
								background="transparent"
								border="subtle"
								overflow="hidden"
								padding="none"
								radius="lg"
								shadow="none"
							>
								<Section
									padding="soft"
									background="surface"
									className="min-h-[240px]"
									innerClassName="flex h-full flex-col gap-4"
								>
									<Section.Background interactive>
										<div className="h-full w-full bg-linear-to-br from-primary/10 via-transparent to-foreground/5" />
										<Button
											size="sm"
											variant="secondary"
											className="absolute bottom-4 right-4"
											onClick={() => setTaps((value) => value + 1)}
										>
											Background action
										</Button>
									</Section.Background>
									<div className="flex max-w-md flex-col gap-2">
										<Text as="h3" variant="headingMd">
											Interactive backgrounds stay opt-in
										</Text>
										<Text variant="body" tone="muted">
											By default the background is decorative and ignores
											pointer events. Set <code>interactive</code> only when the
											background needs real controls.
										</Text>
									</div>
									<Panel
										border="subtle"
										display="flex"
										padding="sm"
										gap="sm"
										shadow="none"
										className="max-w-md"
									>
										<Text variant="bodyStrong">
											Interactive background taps
										</Text>
										<Text variant="caption" tone="muted">
											{taps} tap{taps === 1 ? "" : "s"} registered from the
											background action.
										</Text>
									</Panel>
								</Section>
							</Panel>
						);
					},
				},
			],
		},
	],
};
