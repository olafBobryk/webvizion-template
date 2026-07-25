import clsx from "clsx";
import type { ReactNode } from "react";

export function InternalCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={clsx(
				"rounded-md border border-border bg-background p-5",
				className,
			)}
		>
			{children}
		</div>
	);
}
