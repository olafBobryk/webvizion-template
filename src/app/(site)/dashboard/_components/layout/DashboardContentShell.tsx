import clsx from "clsx";
import type { ReactNode } from "react";
import type { DashboardLayoutWidth } from "../../_registry/surfaceRegistry";

type DashboardContentShellProfile = {
	bodyClassName: string;
	contentClassName: string;
	gutterClassName: string;
	mainClassName: string;
};

const dashboardPageGutterClassName = "px-4 sm:px-6";

export const dashboardContentShellProfiles = {
	standard: {
		bodyClassName: "",
		contentClassName: "min-h-[calc(100svh-8rem)]",
		gutterClassName: dashboardPageGutterClassName,
		mainClassName: "mx-auto max-w-6xl gap-5 pb-8 pt-24",
	},
	wide: {
		bodyClassName: "",
		contentClassName: "min-h-[calc(100svh-8rem)]",
		gutterClassName: dashboardPageGutterClassName,
		mainClassName: "min-w-0 gap-5 pb-8 pt-24",
	},
	workspace: {
		bodyClassName: "h-full",
		contentClassName: "min-h-0 flex-1",
		gutterClassName: "px-0",
		mainClassName: "h-svh min-h-0 overflow-hidden pb-0 pt-16",
	},
} as const satisfies Record<DashboardLayoutWidth, DashboardContentShellProfile>;

export function DashboardContentShell({
	children,
	layoutWidth,
	overlay,
}: {
	children: ReactNode;
	layoutWidth: DashboardLayoutWidth;
	overlay?: ReactNode;
}) {
	const profile = dashboardContentShellProfiles[layoutWidth];
	return (
		<main
			className={clsx(
				"flex w-full flex-col",
				profile.mainClassName,
				profile.gutterClassName,
			)}
			data-dashboard-layout={layoutWidth}
			id="dashboard-main"
			tabIndex={-1}
		>
			<div className={clsx("relative min-w-0", profile.contentClassName)}>
				<div
					aria-hidden={overlay ? true : undefined}
					className={clsx(
						"min-w-0",
						profile.bodyClassName,
						overlay && "invisible pointer-events-none",
					)}
				>
					{children}
				</div>
				{overlay ? (
					<div className="absolute inset-0 bg-background">{overlay}</div>
				) : null}
			</div>
		</main>
	);
}
