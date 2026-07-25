"use client";

import {
	ComponentCard,
	ComponentGroup,
} from "@/app/(site)/(dev)/internal/demo/_components/demo-cards";
import type {
	DemoComponentItem,
	DemoPage as DemoPageType,
} from "@/app/(site)/(dev)/internal/demo/content";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";

export type DemoPageProps = {
	page?: DemoPageType;
	mode?: "full" | "skeleton";
};

const buildSkeletonItem = (
	item: DemoComponentItem,
	skeleton: NonNullable<DemoComponentItem["skeleton"]>,
): DemoComponentItem => {
	return {
		id: `${item.id}-skeleton`,
		kind: "component",
		name: skeleton.name ?? `${item.name}.Skeleton`,
		label: "Skeleton",
		related: skeleton.related ?? item.related,
		className: skeleton.className ?? item.className,
		Render: skeleton.Render,
	};
};

const buildLiveItem = (item: DemoComponentItem): DemoComponentItem => ({
	id: `${item.id}-live`,
	kind: "component",
	name: item.name,
	label: "Live",
	related: item.related,
	className: item.className,
	Render: item.Render,
});

export function DemoPage({ page, mode = "full" }: DemoPageProps) {
	if (!page) {
		return (
			<div className="flex flex-col gap-6">
				<header className="flex flex-col gap-2">
					<Text as="h1" variant="headingLg">
						Demo page not found
					</Text>
					<Text variant="body" tone="muted">
						This demo route does not exist yet.
					</Text>
				</header>
				<Card>
					<Card.Content className="flex flex-col gap-4">
						<Text variant="body">Go back to the demo index.</Text>
						<Button
							href="/internal/demo"
							variant="secondary"
							size="sm"
							className="w-fit"
						>
							Open demo index
						</Button>
					</Card.Content>
				</Card>
			</div>
		);
	}

	const hasSkeletons = page.groups.some((group) =>
		group.items.some(
			(item) => item.kind === "component" && Boolean(item.skeleton),
		),
	);
	const isSkeletonMode = mode === "skeleton";
	const basePath = page.slug.length
		? `/internal/demo/${page.slug.join("/")}`
		: "/internal/demo";
	const skeletonPath = `${basePath}/skeleton`;

	const visibleGroups = isSkeletonMode
		? page.groups.filter((group) =>
				group.items.some(
					(item) => item.kind === "component" && Boolean(item.skeleton),
				),
			)
		: page.groups;

	return (
		<div className="flex flex-col gap-6">
			<header className="flex flex-col gap-2">
				<Text as="h1" variant="headingLg">
					{page.title}
				</Text>
				{page.description ? (
					<Text variant="body" tone="muted">
						{page.description}
					</Text>
				) : null}
				{hasSkeletons && page.slug.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						<Button
							href={isSkeletonMode ? basePath : skeletonPath}
							variant="secondary"
							size="sm"
						>
							{isSkeletonMode ? "View full demos" : "View skeletons"}
						</Button>
					</div>
				) : null}
			</header>

			<div className="grid gap-8">
				{visibleGroups.map((group) => (
					<ComponentGroup
						key={group.id}
						title={group.title}
						description={group.description}
						columns={isSkeletonMode ? "grid-cols-1" : group.columns}
					>
						{isSkeletonMode
							? group.items.flatMap((item) => {
									if (item.kind !== "component" || !item.skeleton) return [];
									const liveItem = buildLiveItem(item);
									const skeletonItem = buildSkeletonItem(item, item.skeleton);
									return [
										<div
											key={`${item.id}-pair`}
											className="grid gap-3 grid-cols-1 md:grid-cols-2"
										>
											<ComponentCard
												name={liveItem.name}
												label={liveItem.label}
												related={liveItem.related}
												className={liveItem.className}
											>
												<liveItem.Render />
											</ComponentCard>
											<ComponentCard
												name={skeletonItem.name}
												label={skeletonItem.label}
												related={skeletonItem.related}
												className={skeletonItem.className}
											>
												<skeletonItem.Render />
											</ComponentCard>
										</div>,
									];
								})
							: group.items.map((item) => (
									<ComponentCard
										key={item.id}
										name={item.name}
										label={item.label}
										related={item.related}
										className={item.className}
									>
										<item.Render />
									</ComponentCard>
								))}
					</ComponentGroup>
				))}
			</div>
		</div>
	);
}
