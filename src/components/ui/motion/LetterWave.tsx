"use client";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Text, type textVariants } from "@/components/ui/primitives/Text";
import { useAppReady } from "@/hooks/useAppReady";

type LetterWaveProps = {
	children: string;
	as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label";
	className?: string;
} & VariantProps<typeof textVariants>;

/**
 * Renders text with a per-character wave animation on group-hover.
 * Requires a parent with the `group` class to trigger the hover animation.
 */
export function LetterWave({
	children,
	as = "span",
	className,
	variant,
	tone,
}: LetterWaveProps) {
	const appReady = useAppReady();
	const sharedTextProps = {
		variant,
		tone,
		className,
	};
	const renderText = (content: ReactNode) => {
		switch (as) {
			case "p":
				return (
					<Text as="p" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "div":
				return (
					<Text as="div" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "h1":
				return (
					<Text as="h1" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "h2":
				return (
					<Text as="h2" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "h3":
				return (
					<Text as="h3" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "h4":
				return (
					<Text as="h4" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "h5":
				return (
					<Text as="h5" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "h6":
				return (
					<Text as="h6" {...sharedTextProps}>
						{content}
					</Text>
				);
			case "label":
				return (
					<Text as="label" {...sharedTextProps}>
						{content}
					</Text>
				);
			default:
				return (
					<Text as="span" {...sharedTextProps}>
						{content}
					</Text>
				);
		}
	};

	if (!appReady) {
		return renderText(children);
	}

	return renderText(
		<>
			<span className="sr-only">{children}</span>
			<span aria-hidden={true}>
				{children.split("").map((char, index) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: character position is the identity
						key={index}
						className="letter-wave-character inline-block"
						style={{ animationDelay: `${index * 22}ms` }}
					>
						{char === " " ? "\u00A0" : char}
					</span>
				))}
			</span>
		</>,
	);
}
