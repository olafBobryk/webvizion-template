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
import { Panel } from "@/components/ui/primitives/surfaces";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import { hrefFor } from "@/lib/routes";
import { isDashboardDebugState } from "../../_registry/debug";
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
import { DashboardContentShell } from "./DashboardContentShell";
import { DashboardOrganizationSwitcher } from "./DashboardOrganizationSwitcher";
import { DashboardSidebarNav } from "./DashboardSidebarNav";
import {
	DashboardSidebarShell,
	getDashboardSidebarOffsetClassNames,
} from "./DashboardSidebarShell";

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
				"flex w-full gap-1",
				collapsed
					? "flex-col items-center justify-center"
					: "flex-row flex-wrap items-center justify-start",
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
							iconSize={16}
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
							iconSize={16}
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
	const { membership, organization, organizationChoices, user } =
		useDashboardAuth();
	const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
	const [forceLoading, setForceLoading] = React.useState(false);
	const surface = getDashboardSurface(pathname);
	const layoutWidth = surface?.layoutWidth ?? "standard";
	const capabilities = React.useMemo(
		() => getDashboardCapabilities(membership.role, user?.platformRole ?? null),
		[membership.role, user?.platformRole],
	);
	const debugEnabled = capabilities.has("debug.use");
	const debugStateValue = searchParams.get("debug-state");
	const debugState =
		debugEnabled && isDashboardDebugState(debugStateValue)
			? debugStateValue
			: debugEnabled && forceLoading
				? "loading"
				: null;
	const currentRoute = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
	const sidebarOffsetClassNames =
		getDashboardSidebarOffsetClassNames(sidebarCollapsed);

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
			canSwitchOrganizations={organizationChoices.length > 1}
			capabilities={capabilities}
			organization={organization}
		>
			<div className="min-h-screen bg-background text-foreground">
				<DashboardSidebarShell
					body={
						<div className="grid min-w-0 grid-cols-[minmax(0,1fr)]">
							<div className="border-b border-sidebar-border/70 px-2 pb-3 lg:px-3">
								<DashboardOrganizationSwitcher
									collapsed={sidebarCollapsed}
									mobileExpanded={mobileSidebarOpen}
									onNavigate={() => setMobileSidebarOpen(false)}
								/>
							</div>
							<div className="px-2 pt-3 lg:px-3">
								<DashboardSidebarNav
									collapsed={sidebarCollapsed}
									mobileExpanded={mobileSidebarOpen}
									onNavigate={() => setMobileSidebarOpen(false)}
								/>
							</div>
						</div>
					}
					brand={
						<div className="flex translate-y-px items-center pl-3.5">
							<Logo
								className={clsx(
									mobileSidebarOpen
										? "inline-flex max-lg:-ml-1"
										: "max-lg:!hidden",
								)}
								href={hrefFor("dashboard.overview")}
								size="sm"
								tone="dark"
							/>
						</div>
					}
					collapsed={sidebarCollapsed}
					footer={
						<>
							<div className="w-full lg:hidden">
								<DashboardFooterActions
									collapsed={!mobileSidebarOpen}
									currentRoute={currentRoute}
									onNavigate={() => setMobileSidebarOpen(false)}
									platformAdmin={user?.platformRole === "admin"}
								/>
							</div>
							<div className="w-full max-lg:hidden">
								<DashboardFooterActions
									collapsed={sidebarCollapsed}
									currentRoute={currentRoute}
									onNavigate={() => undefined}
									platformAdmin={user?.platformRole === "admin"}
								/>
							</div>
						</>
					}
					mobileOpen={mobileSidebarOpen}
					onCollapsedChange={setSidebarCollapsed}
					onMobileOpenChange={setMobileSidebarOpen}
				/>
				<div className={sidebarOffsetClassNames.content}>
					<Panel
						as="header"
						background="page"
						border="none"
						className={sidebarOffsetClassNames.header}
						data-shell-surface="dashboard-header"
						display="block"
						gap="none"
						overflow="visible"
						padding="none"
						radius="none"
						style={{
							backgroundColor:
								"color-mix(in oklab, var(--color-background) 84%, transparent)",
						}}
						width="auto"
					>
						<div className="flex min-h-14 items-center gap-2 px-3 sm:px-5">
							<div className="flex min-w-0 flex-1 items-center justify-end">
								<DashboardCommandTrigger />
							</div>
							<div className="ml-auto flex items-center gap-2">
								<DashboardAccountMenu />
							</div>
						</div>
					</Panel>
					<DashboardContentShell
						layoutWidth={layoutWidth}
						overlay={
							debugState ? (
								<DashboardDebugStateView
									pathname={pathname}
									state={debugState}
								/>
							) : undefined
						}
					>
						{children}
					</DashboardContentShell>
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
