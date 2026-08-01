"use client";

import type { OrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import { EntitySelector } from "../EntitySelector";
import type { OrganizationIdentityVisual } from "./OrganizationAvatar";
import { OrganizationIdentity } from "./OrganizationIdentity";

function OrganizationSelectorRoot({
	description,
	disabled,
	label = "Organization",
	name,
	onChange,
	organizations,
	value,
	visual,
}: {
	description?: string;
	disabled?: boolean;
	label?: string;
	name?: string;
	onChange: (organizationId: string) => void;
	organizations: readonly OrganizationPresentation[];
	value: string | null;
	visual?: OrganizationIdentityVisual;
}) {
	return (
		<EntitySelector
			description={description}
			disabled={disabled}
			getOptionLabel={(organization) => organization.displayLabel}
			getOptionSearchText={(organization) => organization.searchText}
			getOptionValue={(organization) => organization.id}
			items={organizations}
			label={label}
			name={name}
			onChange={onChange}
			placeholder="Select an organization"
			renderOption={(organization) => (
				<OrganizationIdentity
					className="w-full"
					presentation={organization}
					variant="default"
					visual={visual}
				/>
			)}
			value={value}
		/>
	);
}

function OrganizationSelectorSkeleton({
	description,
	label = "Organization",
}: {
	description?: string;
	label?: string;
}) {
	return (
		<EntitySelector.Skeleton
			description={description}
			label={label}
			value="Example organization"
		/>
	);
}

export const OrganizationSelector = Object.assign(OrganizationSelectorRoot, {
	Skeleton: OrganizationSelectorSkeleton,
});
