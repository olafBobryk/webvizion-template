import clsx from "clsx";
import type { ReactNode } from "react";
import { Section } from "@/components/ui/primitives/Section";
import { Text } from "@/components/ui/primitives/Text";

type InternalPageProps = {
	children: ReactNode;
	className?: string;
	maxWidth?: "default" | "wide" | "narrow" | "none";
};

export function InternalPage({
	children,
	className,
	maxWidth = "default",
}: InternalPageProps) {
	return (
		<main>
			<Section
				padding="hero"
				maxWidth={maxWidth}
				innerClassName={clsx("gap-6", className)}
			>
				{children}
			</Section>
		</main>
	);
}

type InternalPageHeaderProps = {
	action?: ReactNode;
	className?: string;
	description?: ReactNode;
	title: ReactNode;
};

export function InternalPageHeader({
	action,
	className,
	description,
	title,
}: InternalPageHeaderProps) {
	return (
		<header className={clsx("flex max-w-3xl flex-col gap-3", className)}>
			{action}
			<div className="flex flex-col gap-2">
				<Text as="h1" variant="headingLg">
					{title}
				</Text>
				{description ? (
					<Text variant="body" tone="muted">
						{description}
					</Text>
				) : null}
			</div>
		</header>
	);
}
