"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import Logo from "@/components/branding/Logo";
import {
	instantTransition,
	resolveMotionTransition,
} from "@/components/ui/foundations/motionTiming";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import { hrefFor } from "@/lib/routes";
import {
	dashboardDebugEnabled,
	isDashboardDebugState,
} from "../../_registry/debug";
import {
	getDashboardCapabilities,
	getDashboardSurface,
} from "../../_registry/surfaceRegistry";
import {
	DashboardCommandProvider,
	DashboardCommandTrigger,
} from "../commands/DashboardCommandProvider";
import { DashboardDebugMenu } from "../debug/DashboardDebugMenu";
import { DashboardDebugStateView } from "../debug/DashboardDebugStateView";
import { ReportIssueModal } from "../feedback/ReportIssueModal";
import { useDashboardAuth } from "../providers/DashboardAuthProvider";
import { DashboardAccountMenu } from "./DashboardAccountMenu";
import { DashboardOrganizationSwitcher } from "./DashboardOrganizationSwitcher";
import { DashboardSidebarNav } from "./DashboardSidebarNav";

const forceLoadingStorageKey = "averlo-dashboard:force-loading";
const footerLayoutTransition = resolveMotionTransition("overlay", {
	distance: "near",
	intensity: "subtle",
	surface: "flat",
});

function DashboardFooterActions({
	collapsed,
	currentRoute,
	onNavigate,
	platformAdmin,
}: {
	collapsed: boolean;
	currentRoute: string;
	onNavigate: () => void;
	platformAdmin: boolean;
}) {
	const { openModal } = useModal();
	const motionAllowed = useMotionAllowed(true);

	function openReportIssue() {
		openModal(
			({ close, setCloseDisabled }) => (
				<ReportIssueModal
					currentRoute={currentRoute}
					onClose={close}
					onCloseDisabledChange={setCloseDisabled}
				/>
			),
			{
				ariaLabel: "Report issue",
				cardProps: { maxWidth: "xl" },
				id: "dashboard-report-issue",
			},
		);
		onNavigate();
	}

	const actions = [
		{
			href: hrefFor("dashboard.support"),
			icon: "question",
			id: "support",
			label: "Support",
		},
		{
			icon: "flag",
			id: "report",
			label: "Report issue",
			onClick: openReportIssue,
		},
		...(platformAdmin
			? [
					{
						href: hrefFor("dashboard.platform"),
						icon: "shield",
						id: "platform",
						label: "Manage platform",
					},
				]
			: []),
	] as const;

	return (
		<div
			className={clsx(
				"flex w-full items-center gap-1",
				collapsed ? "flex-col" : "flex-row flex-wrap justify-start",
			)}
		>
			{actions.map((action) => (
				<motion.span
					className="inline-flex"
					key={action.id}
					layout="position"
					transition={
						motionAllowed ? footerLayoutTransition : instantTransition
					}
				>
					{"href" in action ? (
						<Button
							aria-label={action.label}
							className="!text-muted-foreground hover:!text-sidebar-accent-foreground"
							href={action.href}
							iconSize={20}
							leadingIcon={action.icon}
							onClick={onNavigate}
							size="icon"
							title={action.label}
							variant="ghost"
						/>
					) : (
						<Button
							aria-label={action.label}
							className="!text-muted-foreground hover:!text-sidebar-accent-foreground"
							iconSize={20}
							leadingIcon={action.icon}
							onClick={action.onClick}
							size="icon"
							title={action.label}
							type="button"
							variant="ghost"
						/>
					)}
				</motion.span>
			))}
		</div>
	);
}

export function DashboardFrame({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { membership, organization, user } = useDashboardAuth();
	const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
	const [forceLoading, setForceLoading] = React.useState(false);
	const surface = getDashboardSurface(pathname);
	const capabilities = React.useMemo(
		() => getDashboardCapabilities(membership.role, user?.platformRole ?? null),
		[membership.role, user?.platformRole],
	);
	const debugStateValue = searchParams.get("debug-state");
	const debugState =
		dashboardDebugEnabled && isDashboardDebugState(debugStateValue)
			? debugStateValue
			: forceLoading
				? "loading"
				: null;
	const currentRoute = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

	React.useEffect(() => {
		try {
			setForceLoading(
				window.localStorage.getItem(forceLoadingStorageKey) === "1",
			);
		} catch {
			setForceLoading(false);
		}
	}, []);

	React.useEffect(() => {
		if (!pathname) return;
		setMobileSidebarOpen(false);
	}, [pathname]);

	function handleForceLoadingChange(value: boolean) {
		setForceLoading(value);
		try {
			if (value) window.localStorage.setItem(forceLoadingStorageKey, "1");
			else window.localStorage.removeItem(forceLoadingStorageKey);
		} catch {
			// The in-memory control remains useful when storage is unavailable.
		}
	}

	return (
		<DashboardCommandProvider
			capabilities={capabilities}
			organization={organization}
		>
			<div className="min-h-screen bg-background text-foreground">
				{mobileSidebarOpen ? (
					<button
						aria-label="Close sidebar"
						className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[2px] lg:hidden"
						onClick={() => setMobileSidebarOpen(false)}
						type="button"
					/>
				) : null}
				<aside
					className={clsx(
						"fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] motion-macro",
						mobileSidebarOpen ? "w-[260px]" : "w-[64px]",
						sidebarCollapsed ? "lg:w-[72px]" : "lg:w-[260px]",
					)}
					id="dashboard-sidebar"
				>
					<div
						className={clsx(
							"flex min-h-16 items-center gap-2 border-b border-sidebar-border/70 px-3",
							mobileSidebarOpen ? "justify-between" : "justify-center",
							sidebarCollapsed ? "lg:justify-center" : "lg:justify-between",
						)}
					>
						{!sidebarCollapsed ? (
							<Logo
								className={clsx(
									mobileSidebarOpen ? "inline-flex" : "max-lg:!hidden",
								)}
								href={hrefFor("dashboard.overview")}
								size="sm"
							/>
						) : null}
						<Button
							aria-expanded={mobileSidebarOpen}
							aria-label={
								mobileSidebarOpen ? "Collapse sidebar" : "Open sidebar"
							}
							className="!size-10 !p-0 lg:hidden"
							leadingIcon={mobileSidebarOpen ? "sidebar-collapse" : "menu"}
							onClick={() => setMobileSidebarOpen((current) => !current)}
							size="icon-sm"
							variant="ghost"
						/>
						<Button
							aria-expanded={!sidebarCollapsed}
							aria-label={
								sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
							}
							className="!size-10 !p-0 max-lg:hidden"
							leadingIcon={sidebarCollapsed ? "menu" : "sidebar-collapse"}
							onClick={() => setSidebarCollapsed((current) => !current)}
							size="icon-sm"
							variant="ghost"
						/>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto py-4">
						<div className="grid">
							<div className="border-b border-sidebar-border/70 px-2 pb-4 lg:px-3">
								<DashboardOrganizationSwitcher
									collapsed={sidebarCollapsed}
									mobileExpanded={mobileSidebarOpen}
									onNavigate={() => setMobileSidebarOpen(false)}
								/>
							</div>
							<div className="px-2 pt-4 lg:px-3">
								<DashboardSidebarNav
									collapsed={sidebarCollapsed}
									mobileExpanded={mobileSidebarOpen}
									onNavigate={() => setMobileSidebarOpen(false)}
								/>
							</div>
						</div>
					</div>
					<div className="border-t border-sidebar-border/70 p-3">
						<div className="lg:hidden">
							<DashboardFooterActions
								collapsed={!mobileSidebarOpen}
								currentRoute={currentRoute}
								onNavigate={() => setMobileSidebarOpen(false)}
								platformAdmin={user?.platformRole === "admin"}
							/>
						</div>
						<div className="max-lg:hidden">
							<DashboardFooterActions
								collapsed={sidebarCollapsed}
								currentRoute={currentRoute}
								onNavigate={() => undefined}
								platformAdmin={user?.platformRole === "admin"}
							/>
						</div>
					</div>
				</aside>
				<div
					className={clsx(
						"min-w-0 transition-[padding] motion-macro",
						sidebarCollapsed
							? "pl-[64px] lg:pl-[72px]"
							: "pl-[64px] lg:pl-[260px]",
					)}
				>
					<header
						className={clsx(
							"fixed right-0 top-0 z-30 border-b border-border/75 bg-background/84 backdrop-blur-xl transition-[left] motion-macro",
							sidebarCollapsed
								? "left-[64px] lg:left-[72px]"
								: "left-[64px] lg:left-[260px]",
						)}
					>
						<div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
							<div className="flex min-w-0 flex-1 items-center justify-end">
								<DashboardCommandTrigger />
							</div>
							<div className="ml-auto flex items-center gap-2">
								<DashboardAccountMenu />
							</div>
						</div>
					</header>
					<main
						className={clsx(
							"flex w-full flex-col gap-5 pb-8 pt-24",
							surface?.layoutWidth === "wide"
								? "min-w-0 px-4 sm:px-6"
								: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
						)}
						id="dashboard-main"
						tabIndex={-1}
					>
						<div className="relative min-h-[calc(100svh-8rem)] min-w-0">
							<div
								aria-hidden={debugState ? true : undefined}
								className={clsx(
									"min-w-0",
									debugState && "invisible pointer-events-none",
								)}
							>
								{children}
							</div>
							{debugState ? (
								<div className="absolute inset-0 bg-background">
									<DashboardDebugStateView
										pathname={pathname}
										state={debugState}
									/>
								</div>
							) : null}
						</div>
					</main>
				</div>
				<DashboardDebugMenu
					capabilities={capabilities}
					forceLoading={forceLoading}
					onForceLoadingChange={handleForceLoadingChange}
				/>
			</div>
		</DashboardCommandProvider>
	);
}
