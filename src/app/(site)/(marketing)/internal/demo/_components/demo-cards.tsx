"use client";

import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import type { RelatedInfo } from "../content";

export type { RelatedInfo } from "../content";

function formatRelated(items: string[]) {
	if (!items.length) return "none";
	if (items.length <= 4) return items.join(", ");
	return `${items.slice(0, 4).join(", ")} +${items.length - 4} more`;
}

function RelatedItems({ uses, usedIn }: RelatedInfo) {
	return (
		<div className="flex flex-col gap-1 text-xs text-muted-foreground">
			<div>
				<Text variant="caption" tone="muted" className="text-xs">
					Uses: {formatRelated(uses)}
				</Text>
			</div>
			<div>
				<Text variant="caption" tone="muted" className="text-xs">
					Used by: {formatRelated(usedIn)}
				</Text>
			</div>
		</div>
	);
}

export type ComponentCardProps = {
	name: string;
	label: string;
	children: React.ReactNode;
	className?: string;
	related?: RelatedInfo;
};

export function ComponentCard({
	name,
	label,
	children,
	className,
	related,
}: ComponentCardProps) {
	return (
		<Card
			size="sm"
			className={["h-full min-w-0 self-stretch", className]
				.filter(Boolean)
				.join(" ")}
		>
			<Card.Header className="border-b">
				<Card.Title as="h3">{name}</Card.Title>
				<Card.Action>
					<Text
						variant="caption"
						tone="muted"
						className="min-w-0 break-words text-right text-xs"
					>
						{label}
					</Text>
				</Card.Action>
			</Card.Header>
			<Card.Content className="min-h-[44px] min-w-0 flex-1">
				{children}
			</Card.Content>
			{related ? (
				<Card.Footer>
					<RelatedItems {...related} />
				</Card.Footer>
			) : null}
		</Card>
	);
}

export type ComponentGroupProps = {
	title: string;
	description?: string;
	columns?: string;
	children: React.ReactNode;
};

export function ComponentGroup({
	title,
	description,
	columns,
	children,
}: ComponentGroupProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-end justify-between gap-4">
				<div className="flex flex-col gap-1">
					<Text as="h2" variant="headingSm">
						{title}
					</Text>
					{description ? (
						<Text variant="caption" tone="muted" className="text-xs">
							{description}
						</Text>
					) : null}
				</div>
			</div>
			<div
				className={[
					"grid items-stretch gap-3",
					columns ?? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
				]
					.filter(Boolean)
					.join(" ")}
			>
				{children}
			</div>
		</div>
	);
}
