"use client";

import clsx from "clsx";
import Logo from "@/components/branding/Logo";
import * as Reveal from "@/components/ui/motion/reveal";
import { Text } from "@/components/ui/primitives/Text";

type StatusContentProps = {
	heading: React.ReactNode;
	body: React.ReactNode;
	actions?: React.ReactNode;
	details?: React.ReactNode;
	className?: string;
	enableRevealMotion?: boolean;
};

export function StatusContent({
	heading,
	body,
	actions,
	details,
	className,
	enableRevealMotion = true,
}: StatusContentProps) {
	return (
		<div
			className={clsx(
				"flex w-full max-w-xl flex-col items-center justify-center gap-3 text-center",
				className,
			)}
		>
			{enableRevealMotion ? (
				<Reveal.Sequence className="flex w-full flex-col items-center justify-center gap-3">
					<Reveal.Item>
						<Logo size="md" variant="mark" />
					</Reveal.Item>
					<Reveal.Item>
						<Text as="h1" variant="headingXl">
							{heading}
						</Text>
					</Reveal.Item>
					<Reveal.Item>
						<Text variant="body" tone="muted">
							{body}
						</Text>
					</Reveal.Item>
					{actions ? (
						<Reveal.Item>
							<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
								{actions}
							</div>
						</Reveal.Item>
					) : null}
				</Reveal.Sequence>
			) : (
				<>
					<Logo size="md" variant="mark" />
					<Text as="h1" variant="headingXl">
						{heading}
					</Text>
					<Text variant="body" tone="muted">
						{body}
					</Text>
					{actions ? (
						<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
							{actions}
						</div>
					) : null}
				</>
			)}
			{details}
		</div>
	);
}
