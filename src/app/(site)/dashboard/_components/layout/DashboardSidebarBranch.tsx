"use client";

import clsx from "clsx";
import Link from "next/link";
import * as React from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { Accordion } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { usePersistentSidebarDisclosure } from "./sidebarDisclosure";

export function DashboardSidebarItem({
	active,
	actions,
	className,
	collapsed = false,
	href,
	icon = "chat",
	label,
	mobileExpanded = true,
	onNavigate,
}: {
	active: boolean;
	actions?: React.ReactNode;
	className?: string;
	collapsed?: boolean;
	href: string;
	icon?: IconName;
	label: string;
	mobileExpanded?: boolean;
	onNavigate: () => void;
}) {
	return (
		<div
			className={clsx(
				"group/sidebar-row relative flex w-full min-w-0 items-center gap-0.5 rounded-md transition-all motion-interactive",
				active
					? "bg-primary/10 text-primary"
					: [
							"text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
							mobileExpanded && "max-lg:hover:translate-x-0.5",
							!collapsed && "lg:hover:translate-x-0.5",
						],
				className,
			)}
			data-sidebar-active-row={active ? "true" : undefined}
		>
			<Link
				aria-current={active ? "page" : undefined}
				aria-label={label}
				className={clsx(
					"relative flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md text-sm font-medium outline-none",
					mobileExpanded
						? "max-lg:justify-start max-lg:px-2.5"
						: "max-lg:justify-center max-lg:px-2",
					collapsed
						? "lg:justify-center lg:px-2"
						: "lg:justify-start lg:px-2.5",
					focusRing.visibleDefault,
				)}
				href={href}
				onClick={onNavigate}
				title={label}
			>
				<Icon className="shrink-0" name={icon} size="md" />
				<span
					className={clsx(
						"min-w-0 flex-1 truncate",
						mobileExpanded ? "max-lg:block" : "max-lg:hidden",
						collapsed ? "lg:hidden" : "lg:block",
					)}
				>
					{label}
				</span>
			</Link>
			{actions ? (
				<span
					className={clsx(
						"shrink-0 items-center gap-1.5 pr-1.5 leading-none [&>*]:flex [&>*]:items-center",
						mobileExpanded ? "max-lg:flex" : "max-lg:hidden",
						collapsed ? "lg:hidden" : "lg:flex",
					)}
				>
					{actions}
				</span>
			) : null}
		</div>
	);
}

export function DashboardSidebarBranch({
	active = false,
	children,
	collapsed = false,
	defaultOpen,
	href,
	icon,
	label,
	mobileExpanded = true,
	onNavigate,
	storageId,
}: {
	active?: boolean;
	children: React.ReactNode;
	collapsed?: boolean;
	defaultOpen: boolean;
	href?: string;
	icon?: IconName;
	label: string;
	mobileExpanded?: boolean;
	onNavigate: () => void;
	storageId: string;
}) {
	const [open, setOpen] = usePersistentSidebarDisclosure(
		storageId,
		defaultOpen,
	);
	const previousDefaultOpen = React.useRef(defaultOpen);
	React.useEffect(() => {
		if (defaultOpen && !previousDefaultOpen.current) setOpen(true);
		previousDefaultOpen.current = defaultOpen;
	}, [defaultOpen, setOpen]);
	if (!href) return null;

	const expandedClassName = clsx(
		mobileExpanded ? "max-lg:grid" : "max-lg:hidden",
		collapsed ? "lg:hidden" : "lg:grid",
	);
	const collapsedClassName = clsx(
		mobileExpanded ? "max-lg:hidden" : "max-lg:flex",
		collapsed ? "lg:flex" : "lg:hidden",
	);
	return (
		<>
			<Accordion
				className={clsx("grid gap-1", expandedClassName)}
				contentClassName="!p-0"
				onOpenChange={setOpen}
				open={open}
				renderTrigger={(triggerProps) => (
					<DashboardSidebarItem
						actions={
							<Button
								aria-label={`${triggerProps["aria-expanded"] ? "Collapse" : "Expand"} ${label}`}
								className="shrink-0 text-inherit"
								size="none"
								{...triggerProps}
								variant="ghost"
							>
								<Icon
									aria-hidden
									className={clsx(
										"transition-transform motion-micro",
										triggerProps["aria-expanded"] && "rotate-180",
									)}
									name="chevron-down"
									size="md"
								/>
							</Button>
						}
						active={active}
						collapsed={collapsed}
						href={href}
						icon={icon}
						label={label}
						mobileExpanded={mobileExpanded}
						onNavigate={onNavigate}
					/>
				)}
				title={label}
			>
				{children}
			</Accordion>
			<DashboardSidebarItem
				active={active}
				className={collapsedClassName}
				collapsed={collapsed}
				href={href}
				icon={icon}
				label={label}
				mobileExpanded={mobileExpanded}
				onNavigate={onNavigate}
			/>
		</>
	);
}
