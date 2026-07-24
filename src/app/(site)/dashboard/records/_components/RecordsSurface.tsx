import type { ComponentProps } from "react";
import { DashboardEntityCommands } from "../../_components/commands/DashboardEntityCommands";
import { RecordCollectionClient } from "../../_components/entities/record/RecordCollectionClient";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { RecordsSurfaceSkeletonClient } from "./RecordsSurfaceSkeleton.client";

export function RecordsSurface({
	commands,
	...collectionProps
}: ComponentProps<typeof RecordCollectionClient> & {
	commands: ComponentProps<typeof DashboardEntityCommands>["commands"];
}) {
	return (
		<DashboardSection
			description={`Organization-scoped reference entities for ${collectionProps.organizationName}.`}
			title="Records"
		>
			<DashboardEntityCommands
				commands={commands}
				ownerId="dashboard.records.entities"
			/>
			<RecordCollectionClient {...collectionProps} />
		</DashboardSection>
	);
}

export function RecordsSurfaceSkeleton() {
	return <RecordsSurfaceSkeletonClient />;
}
