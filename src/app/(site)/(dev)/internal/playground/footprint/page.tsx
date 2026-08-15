import { InternalPage } from "../../_components/InternalPage";
import footprint from "./_data/repository-footprint.json";
import { RepositoryFootprintCharts } from "./RepositoryFootprintCharts";

export default function RepositoryFootprintPage() {
	return (
		<InternalPage maxWidth="wide" className="gap-8">
			<RepositoryFootprintCharts
				encoding={footprint.encoding}
				scope={footprint.scope}
				snapshots={footprint.snapshots}
			/>
		</InternalPage>
	);
}
