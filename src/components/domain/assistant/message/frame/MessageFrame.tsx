import type * as React from "react";

export function MessageFrame({
	ariaLabel,
	children,
}: {
	ariaLabel: "Assistant" | "You";
	children: React.ReactNode;
}) {
	return (
		<article
			aria-label={ariaLabel}
			className="mx-auto flex w-full max-w-3xl gap-3 px-4 sm:px-6"
		>
			<div className="w-full min-w-0">{children}</div>
		</article>
	);
}
