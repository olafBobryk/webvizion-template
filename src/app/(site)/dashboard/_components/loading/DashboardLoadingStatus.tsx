import type { ReactNode } from "react";

export function DashboardLoadingStatus({
	children,
	label,
}: {
	children: ReactNode;
	label: string;
}) {
	return (
		<div aria-busy="true" aria-label={label} role="status">
			{children}
		</div>
	);
}
