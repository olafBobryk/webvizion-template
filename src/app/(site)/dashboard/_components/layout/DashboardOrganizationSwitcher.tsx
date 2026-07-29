"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import * as React from "react";
import { OrganizationIdentity } from "@/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity";
import { toOrganizationEntity } from "@/app/(site)/dashboard/_lib/entities/organization/domain";
import {
	getOrganizationPresentation,
	type OrganizationPresentation,
} from "@/app/(site)/dashboard/_lib/entities/organization/presentation";
import { Dropdown } from "@/components/ui/primitives/Dropdown";
import { selectOrganization } from "@/lib/api/auth";
import { showToast } from "@/lib/feedback/toast";
import { dashboardFeatureConfig } from "../../_registry/surfaceRegistry";
import { useDashboardAuth } from "../providers/DashboardAuthProvider";

type OrganizationSwitcherChoice = {
	id: string;
	presentation: OrganizationPresentation;
};

export function DashboardOrganizationSwitcher({
	collapsed,
	mobileExpanded,
	onNavigate,
}: {
	collapsed: boolean;
	mobileExpanded: boolean;
	onNavigate: () => void;
}) {
	const router = useRouter();
	const { membership, organization, organizationChoices } = useDashboardAuth();
	const [switchingOrganizationId, setSwitchingOrganizationId] = React.useState<
		string | null
	>(null);
	const canSwitch = dashboardFeatureConfig.organizationSwitcher;
	const currentPresentation = getOrganizationPresentation(
		toOrganizationEntity(organization, membership.role),
	);
	const choices: OrganizationSwitcherChoice[] = organizationChoices.map(
		(choice) => ({
			id: choice.organization.id,
			presentation: getOrganizationPresentation(
				toOrganizationEntity(choice.organization, choice.membership.role),
			),
		}),
	);
	async function handleOrganizationSelect(organizationId: string) {
		if (
			organizationId === organization.id ||
			switchingOrganizationId !== null
		) {
			return;
		}
		setSwitchingOrganizationId(organizationId);
		try {
			await showToast.promise(
				selectOrganization(organizationId),
				{
					error: "The organization could not be switched.",
					loading: "Switching organization…",
					success: "Organization switched.",
				},
				{
					errorTitle: "Organization unchanged",
					loadingTitle: "Updating workspace",
					successTitle: "Workspace updated",
				},
			);
			onNavigate();
			router.refresh();
		} catch {
			// The shared toast reports the mutation failure without leaving the listbox stale.
		} finally {
			setSwitchingOrganizationId(null);
		}
	}

	function renderIdentity() {
		return (
			<OrganizationIdentity
				avatarClassName={clsx(
					!mobileExpanded &&
						"max-lg:group-focus-visible:ring-3 max-lg:group-focus-visible:ring-ring/30",
					collapsed &&
						"lg:group-focus-visible:ring-3 lg:group-focus-visible:ring-ring/30",
				)}
				className={clsx(
					"w-full",
					!mobileExpanded && "max-lg:w-auto",
					collapsed && "lg:w-auto",
				)}
				presentation={currentPresentation}
				textClassName={clsx(
					"text-left",
					mobileExpanded ? "max-lg:grid" : "max-lg:hidden",
					collapsed ? "lg:hidden" : "lg:grid",
				)}
				variant="compact"
			/>
		);
	}

	if (!canSwitch) {
		return (
			<div
				className={clsx(
					"flex h-12 min-w-0 items-center px-2",
					mobileExpanded ? "max-lg:justify-start" : "max-lg:justify-center",
					collapsed ? "lg:justify-center" : "lg:justify-start",
				)}
			>
				{renderIdentity()}
			</div>
		);
	}

	return (
		<Dropdown.Listbox
			align="start"
			ariaLabel="Switch organization"
			collisionPadding={12}
			disabled={switchingOrganizationId !== null}
			menuWidth={264}
			offset={8}
			onSelect={(choice) => void handleOrganizationSelect(choice.id)}
			openOnHover={false}
			positionStrategy="fixed"
			options={choices.map((choice) => ({
				content: (
					<OrganizationIdentity
						className="w-full"
						presentation={choice.presentation}
						variant="compact"
					/>
				),
				key: choice.id,
				layout: "presentation",
				selected: choice.id === organization.id,
				value: choice,
			}))}
			triggerButtonProps={{
				className: clsx(
					"h-14 w-full min-w-0 overflow-hidden px-2",
					mobileExpanded
						? "max-lg:justify-start"
						: "max-lg:justify-center max-lg:px-0 max-lg:focus-visible:border-transparent max-lg:focus-visible:ring-0 max-lg:aria-expanded:!bg-transparent max-lg:aria-expanded:hover:!bg-transparent",
					collapsed
						? "lg:justify-center lg:px-0 lg:focus-visible:border-transparent lg:focus-visible:ring-0 lg:aria-expanded:!bg-transparent lg:aria-expanded:hover:!bg-transparent"
						: "lg:justify-start",
					"!border-transparent !bg-transparent hover:!bg-transparent aria-expanded:!bg-sidebar-accent/80 aria-expanded:!text-sidebar-accent-foreground aria-expanded:hover:!bg-sidebar-accent/80",
				),
				radius: "sm",
				size: "none",
				variant: "secondary",
			}}
			triggerContent={renderIdentity()}
		/>
	);
}
