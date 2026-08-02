"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
	getDashboardCapabilities,
	getDashboardSidebarGroups,
	getDashboardSurface,
	getDashboardSurfaceTrail,
	type getVisibleDashboardSurfaces,
} from "../../_registry/surfaceRegistry";
import { useDashboardAuth } from "../providers/DashboardAuthProvider";
import {
	DashboardSidebarBranch,
	DashboardSidebarItem,
} from "./DashboardSidebarBranch";
import { DashboardSidebarSupplement } from "./DashboardSidebarSupplement";

function DashboardSidebarSurfaceBranch({
	active,
	collapsed,
	mobileExpanded,
	onNavigate,
	pathname,
	sectionActive,
	surface,
}: {
	active: boolean;
	collapsed: boolean;
	mobileExpanded: boolean;
	onNavigate: () => void;
	pathname: string;
	sectionActive: boolean;
	surface: ReturnType<typeof getVisibleDashboardSurfaces>[number];
}) {
	const endpoint = surface.sidebarSupplementEndpoint;
	if (!endpoint) return null;
	return (
		<DashboardSidebarBranch
			active={active}
			collapsed={collapsed}
			defaultOpen={sectionActive}
			href={surface.href}
			icon={surface.icon}
			label={surface.label}
			mobileExpanded={mobileExpanded}
			onNavigate={onNavigate}
			storageId={surface.id}
		>
			<DashboardSidebarSupplement
				endpoint={endpoint}
				onNavigate={onNavigate}
				pathname={pathname}
			/>
		</DashboardSidebarBranch>
	);
}

export function DashboardSidebarNav({
	collapsed,
	mobileExpanded,
	onNavigate,
}: {
	collapsed: boolean;
	mobileExpanded: boolean;
	onNavigate: () => void;
}) {
	const pathname = usePathname();
	const { membership, user } = useDashboardAuth();
	const capabilities = getDashboardCapabilities(
		membership.role,
		user?.platformRole ?? null,
	);
	const groups = getDashboardSidebarGroups(capabilities);
	const activeSurface = getDashboardSurface(pathname);
	const activeTrail = getDashboardSurfaceTrail(pathname, capabilities);

	return (
		<nav aria-label="Dashboard navigation" className="grid gap-2 lg:gap-3">
			{groups.map((group, groupIndex) => {
				const assistantSurfaces = group.surfaces.filter(
					(surface) => surface.sidebarSupplementEndpoint,
				);
				const regularSurfaces = group.surfaces.filter(
					(surface) => !surface.sidebarSupplementEndpoint,
				);
				return (
					<React.Fragment key={group.id}>
						<div
							className={clsx(
								"grid gap-1",
								groupIndex > 0 &&
									"border-t border-sidebar-border/65 pt-2 lg:pt-3",
							)}
							data-sidebar-tier={group.tier}
						>
							{regularSurfaces.map((surface) => {
								const exactActive = activeSurface?.id === surface.id;
								const active =
									exactActive ||
									activeTrail.some(
										(ancestor) => ancestor.href === surface.href,
									);
								return (
									<DashboardSidebarItem
										active={active}
										collapsed={collapsed}
										href={surface.href}
										icon={surface.icon}
										key={surface.id}
										label={surface.label}
										mobileExpanded={mobileExpanded}
										onNavigate={onNavigate}
									/>
								);
							})}
						</div>
						{assistantSurfaces.length > 0 ? (
							<div
								className="grid gap-1 border-t border-sidebar-border/65 pt-2 lg:pt-3"
								data-sidebar-tier="assistant"
							>
								{assistantSurfaces.map((surface) => {
									const exactActive = activeSurface?.id === surface.id;
									const sectionActive =
										exactActive ||
										activeTrail.some(
											(ancestor) => ancestor.href === surface.href,
										);
									return (
										<DashboardSidebarSurfaceBranch
											active={exactActive}
											collapsed={collapsed}
											key={surface.id}
											mobileExpanded={mobileExpanded}
											onNavigate={onNavigate}
											pathname={pathname}
											sectionActive={sectionActive}
											surface={surface}
										/>
									);
								})}
								<DashboardSidebarItem
									active={pathname === "/dashboard/assistant/conversations"}
									collapsed={collapsed}
									href="/dashboard/assistant/conversations"
									label="All conversations"
									mobileExpanded={mobileExpanded}
									onNavigate={onNavigate}
								/>
							</div>
						) : null}
					</React.Fragment>
				);
			})}
		</nav>
	);
}
