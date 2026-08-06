"use client";

import clsx from "clsx";
import Logo from "@/components/branding/Logo";
import * as MotionEffect from "@/components/ui/motion/effect";
import * as MotionSource from "@/components/ui/motion/source";
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
				<MotionSource.Sequence className="flex w-full flex-col items-center justify-center gap-3">
					<MotionSource.Root strategy={{ type: "reveal" }}>
						<MotionEffect.Entrance>
							<Logo size="md" variant="mark" />
						</MotionEffect.Entrance>
					</MotionSource.Root>
					<MotionSource.Root strategy={{ type: "reveal" }}>
						<MotionEffect.Entrance>
							<Text as="h1" variant="headingXl">
								{heading}
							</Text>
						</MotionEffect.Entrance>
					</MotionSource.Root>
					<MotionSource.Root strategy={{ type: "reveal" }}>
						<MotionEffect.Entrance>
							<Text variant="body" tone="muted">
								{body}
							</Text>
						</MotionEffect.Entrance>
					</MotionSource.Root>
					{actions ? (
						<MotionSource.Root strategy={{ type: "reveal" }}>
							<MotionEffect.Entrance>
								<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
									{actions}
								</div>
							</MotionEffect.Entrance>
						</MotionSource.Root>
					) : null}
				</MotionSource.Sequence>
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
