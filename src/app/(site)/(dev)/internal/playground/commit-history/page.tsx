import { InternalPage } from "../../_components/InternalPage";
import history from "./_data/commit-history.json";
import { CommitHistoryCharts } from "./CommitHistoryCharts";

export default function CommitHistoryPage() {
	return (
		<InternalPage maxWidth="wide" className="gap-8">
			<CommitHistoryCharts commits={history.commits} />
		</InternalPage>
	);
}
