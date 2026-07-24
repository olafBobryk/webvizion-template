"use client";

import { OrganizationSelectionCard } from "@/app/(site)/_components/organization/OrganizationSelectionCard";
import { useDashboardAuth } from "../../../_components/providers/DashboardAuthProvider";
import { toOrganizationEntity } from "../../../_lib/entities/organization/domain";
import { getOrganizationPresentation } from "../../../_lib/entities/organization/presentation";

export function OrganizationSwitchSurfaceSkeletonClient() {
	const { organization, organizationChoices } = useDashboardAuth();
	const choices = organizationChoices.map(
		({ membership, organization: choice }) => {
			const presentation = getOrganizationPresentation(
				toOrganizationEntity(choice, membership.role),
			);
			return {
				current: choice.id === organization.id,
				displayLabel: presentation.displayLabel,
				key: membership.id,
				secondaryLabel: presentation.secondaryLabel,
			};
		},
	);
	return (
		<section
			aria-busy="true"
			aria-label="Loading organization switcher"
			className="flex min-h-[calc(100svh-10rem)] items-center justify-center py-6 sm:py-10"
			role="status"
		>
			<OrganizationSelectionCard.Skeleton choices={choices} />
		</section>
	);
}
