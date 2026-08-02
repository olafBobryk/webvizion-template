"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
	getDashboardCapabilities,
	getDashboardSidebarGroups,
	getDashboardSurface,
	getDashboardSurfaceTrail,
} from "../../_registry/surfaceRegistry";
import { useDashboardAuth } from "../providers/DashboardAuthProvider";
import { DashboardSidebarItem } from "./DashboardSidebarBranch";
import { DashboardSidebarSupplement } from "./DashboardSidebarSupplement";

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
									const endpoint = surface.sidebarSupplementEndpoint;
									if (!endpoint) return null;
									const exactActive = activeSurface?.id === surface.id;
									const sectionActive =
										exactActive ||
										activeTrail.some(
											(ancestor) => ancestor.href === surface.href,
										);
									return (
										<DashboardSidebarSupplement
											active={exactActive}
											collapsed={collapsed}
											defaultOpen={sectionActive}
											endpoint={endpoint}
											href={surface.href}
											icon={surface.icon}
											key={surface.id}
											label={surface.label}
											mobileExpanded={mobileExpanded}
											onNavigate={onNavigate}
											pathname={pathname}
											storageId={surface.id}
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
