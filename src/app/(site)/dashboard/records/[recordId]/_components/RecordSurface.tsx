import type { ComponentProps } from "react";
import { DashboardEntityCommands } from "../../../_components/commands/DashboardEntityCommands";
import { RecordDetailActions } from "../../../_components/entities/record/RecordDetailActions";
import { RecordDetailContent } from "../../../_components/entities/record/RecordDetailContent";
import { DashboardSection } from "../../../_components/layout/DashboardSection";
import { RecordSurfaceSkeletonClient } from "./RecordSurfaceSkeleton.client";

type RecordSurfaceProps = ComponentProps<typeof RecordDetailContent> & {
	commands: ComponentProps<typeof DashboardEntityCommands>["commands"];
	description: string;
	title: string;
};

export function RecordSurface({
	commands,
	description,
	title,
	...detailProps
}: RecordSurfaceProps) {
	return (
		<DashboardSection
			actions={
				<RecordDetailActions
					canWrite={detailProps.canWrite}
					members={detailProps.members}
					record={detailProps.record}
				/>
			}
			description={description}
			title={title}
		>
			<DashboardEntityCommands
				commands={commands}
				ownerId={`dashboard.record.entities.${detailProps.record.id}`}
			/>
			<RecordDetailContent {...detailProps} />
		</DashboardSection>
	);
}

export function RecordSurfaceSkeleton() {
	return <RecordSurfaceSkeletonClient />;
}
