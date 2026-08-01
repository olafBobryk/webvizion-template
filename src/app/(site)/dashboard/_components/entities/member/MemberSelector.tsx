"use client";

import type { MemberPresentation } from "../../../_lib/entities/member/presentation";
import { EntitySelector } from "../EntitySelector";
import { MemberIdentity } from "./MemberIdentity";

function MemberSelectorRoot({
	description,
	disabled,
	label = "Owner",
	members,
	name,
	onChange,
	value,
}: {
	description?: string;
	disabled?: boolean;
	label?: string;
	members: readonly MemberPresentation[];
	name?: string;
	onChange: (memberId: string) => void;
	value: string | null;
}) {
	return (
		<EntitySelector
			description={description}
			disabled={disabled}
			getOptionLabel={(member) => member.displayLabel}
			getOptionSearchText={(member) => member.searchText}
			getOptionValue={(member) => member.id}
			items={members}
			label={label}
			name={name}
			onChange={onChange}
			placeholder="Select a member"
			renderOption={(member) => (
				<MemberIdentity
					className="w-full"
					presentation={member}
					variant="default"
				/>
			)}
			value={value}
		/>
	);
}

function MemberSelectorSkeleton({
	description,
	label = "Owner",
}: {
	description?: string;
	label?: string;
}) {
	return (
		<EntitySelector.Skeleton
			description={description}
			label={label}
			value="Example member"
		/>
	);
}

export const MemberSelector = Object.assign(MemberSelectorRoot, {
	Skeleton: MemberSelectorSkeleton,
});
