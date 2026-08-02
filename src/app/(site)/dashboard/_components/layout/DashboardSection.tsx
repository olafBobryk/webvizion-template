import { DashboardPageHeader } from "./DashboardPageHeader";
import { DashboardSurfaceTrail } from "./DashboardSurfaceTrail";

export function DashboardSection({
	actions,
	children,
	className,
	contentClassName,
	description,
	title,
}: {
	actions?: React.ReactNode;
	children: React.ReactNode;
	className?: string;
	contentClassName?: string;
	description?: React.ReactNode;
	title?: React.ReactNode;
}) {
	return (
		<section
			className={["grid min-w-0 gap-4", className].filter(Boolean).join(" ")}
		>
			<DashboardSurfaceTrail />
			{title ? (
				<DashboardPageHeader
					action={actions}
					description={description}
					title={title}
				/>
			) : null}
			<div className={["min-w-0", contentClassName].filter(Boolean).join(" ")}>
				{children}
			</div>
		</section>
	);
}
