"use client";

import clsx from "clsx";
import type * as React from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/surfaces";

export type DashboardSidebarShellProps = {
	body: React.ReactNode;
	brand: React.ReactNode;
	collapsed: boolean;
	footer: React.ReactNode;
	mobileOpen: boolean;
	onCollapsedChange: (collapsed: boolean) => void;
	onMobileOpenChange: (open: boolean) => void;
};

export function getDashboardSidebarOffsetClassNames(collapsed: boolean) {
	return {
		content: clsx(
			"min-w-0 transition-[padding] motion-macro",
			collapsed ? "pl-[56px] lg:pl-[72px]" : "pl-[56px] lg:pl-[240px]",
		),
		header: clsx(
			"fixed right-0 top-0 z-30 border-b border-border/75 backdrop-blur-xl transition-[left] motion-macro",
			collapsed ? "left-[56px] lg:left-[72px]" : "left-[56px] lg:left-[240px]",
		),
	};
}

export function DashboardSidebarShell({
	body,
	brand,
	collapsed,
	footer,
	mobileOpen,
	onCollapsedChange,
	onMobileOpenChange,
}: DashboardSidebarShellProps) {
	return (
		<>
			{mobileOpen ? (
				<button
					aria-label="Close sidebar"
					className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[2px] lg:hidden"
					onClick={() => onMobileOpenChange(false)}
					type="button"
				/>
			) : null}
			<Panel
				as="aside"
				background="panel"
				border="none"
				className={clsx(
					"fixed inset-y-0 left-0 z-40 border-r border-sidebar-border text-sidebar-foreground transition-[width] motion-macro",
					mobileOpen ? "!w-[240px]" : "!w-[56px]",
					collapsed ? "lg:!w-[72px]" : "lg:!w-[240px]",
				)}
				data-shell-surface="dashboard-sidebar"
				display="flex"
				gap="none"
				id="dashboard-sidebar"
				overflow="hidden"
				padding="none"
				radius="none"
				width="auto"
			>
				<div
					className={clsx(
						"relative z-10 flex min-h-14 items-center gap-2 overflow-hidden border-b border-sidebar-border/70 px-2",
						mobileOpen ? "justify-between" : "justify-center",
						collapsed ? "lg:justify-center" : "lg:justify-between",
					)}
					data-dashboard-sidebar-header
				>
					{collapsed ? null : brand}
					<Button
						aria-expanded={mobileOpen}
						aria-label={mobileOpen ? "Collapse sidebar" : "Open sidebar"}
						className="!size-10 !p-0 lg:hidden"
						leadingIcon={mobileOpen ? "sidebar-collapse" : "menu"}
						onClick={() => onMobileOpenChange(!mobileOpen)}
						size="icon-sm"
						variant="ghost"
					/>
					<Button
						aria-expanded={!collapsed}
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
						className="!size-9 !p-0 max-lg:hidden"
						leadingIcon={collapsed ? "menu" : "sidebar-collapse"}
						onClick={() => onCollapsedChange(!collapsed)}
						size="icon-sm"
						variant="ghost"
					/>
				</div>
				<div
					className="relative z-10 min-h-0 flex-1 overflow-y-auto py-3"
					data-dashboard-sidebar-body
				>
					{body}
				</div>
				<div
					className="relative z-10 flex min-h-14 shrink-0 items-center justify-center overflow-visible border-t border-sidebar-border/70 p-2"
					data-dashboard-sidebar-footer
				>
					{footer}
				</div>
			</Panel>
		</>
	);
}
