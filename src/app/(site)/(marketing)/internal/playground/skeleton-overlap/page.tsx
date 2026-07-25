import {
	InternalPage,
	InternalPageHeader,
} from "../../_components/InternalPage";
import { SkeletonOverlapExperiment } from "./_components/SkeletonOverlapExperiment";

export default function SkeletonOverlapPlaygroundPage() {
	return (
		<InternalPage className="gap-8" maxWidth="wide">
			<InternalPageHeader
				description="Runtime geometry evidence for a loaded component and its component-owned skeleton."
				title="Skeleton overlap"
			/>
			<SkeletonOverlapExperiment />
		</InternalPage>
	);
}
