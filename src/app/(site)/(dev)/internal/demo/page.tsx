"use client";

import { getVisibleDemoPages } from "@/app/(site)/(dev)/internal/demo/content";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";

function groupPages() {
	const pages = getVisibleDemoPages();
	const sectionOrder: string[] = [];
	const sections = new Map<string, typeof pages>();

	pages.forEach((page) => {
		const root = page.slug[0] ?? "misc";
		if (!sections.has(root)) {
			sections.set(root, []);
			sectionOrder.push(root);
		}
		sections.get(root)?.push(page);
	});

	return sectionOrder.map((key) => ({ key, pages: sections.get(key) ?? [] }));
}

export default function DemoIndexPage() {
	const grouped = groupPages();

	return (
		<div className="w-full space-y-6">
			<header className="flex flex-col gap-2">
				<Text as="h1" variant="headingLg">
					Demo Index
				</Text>
				<Text variant="body" tone="muted">
					Browse live components, states, and skeletons.
				</Text>
			</header>

			<div className="grid gap-6">
				{grouped.map((group) => (
					<section key={group.key} className="grid gap-3">
						<Text as="h2" variant="headingSm">
							{group.key.toUpperCase()}
						</Text>
						<Card>
							<Card.Content>
								<div className="flex flex-wrap gap-2">
									{group.pages.map((page) => (
										<Button
											key={page.id}
											href={`/internal/demo/${page.slug.join("/")}`}
											variant="secondary"
											size="sm"
										>
											{page.title}
										</Button>
									))}
								</div>
							</Card.Content>
						</Card>
					</section>
				))}
			</div>
		</div>
	);
}
