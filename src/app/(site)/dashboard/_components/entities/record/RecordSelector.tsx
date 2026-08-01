"use client";

import type { RecordPresentation } from "../../../_lib/entities/record/presentation";
import { EntitySelector } from "../EntitySelector";
import { RecordIdentity } from "./RecordIdentity";

function RecordSelectorRoot({
	description,
	disabled,
	label = "Record",
	name,
	onChange,
	records,
	value,
}: {
	description?: string;
	disabled?: boolean;
	label?: string;
	name?: string;
	onChange: (recordId: string) => void;
	records: readonly RecordPresentation[];
	value: string | null;
}) {
	return (
		<EntitySelector
			description={description}
			disabled={disabled}
			getOptionLabel={(record) => record.title}
			getOptionSearchText={(record) => record.searchText}
			getOptionValue={(record) => record.id}
			items={records}
			label={label}
			name={name}
			onChange={onChange}
			placeholder="Select a record"
			renderOption={(record) => (
				<RecordIdentity
					className="w-full"
					presentation={record}
					variant="default"
				/>
			)}
			value={value}
		/>
	);
}

function RecordSelectorSkeleton({
	description,
	label = "Record",
}: {
	description?: string;
	label?: string;
}) {
	return (
		<EntitySelector.Skeleton
			description={description}
			label={label}
			value="Example record"
		/>
	);
}

export const RecordSelector = Object.assign(RecordSelectorRoot, {
	Skeleton: RecordSelectorSkeleton,
});
