import type { Metadata } from "next";
import { FilterDashboardBenchmark } from "./FilterDashboardBenchmark";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
	title: "Design-system filter benchmark",
};

export default function DesignSystemFilterBenchmarkPage() {
	return <FilterDashboardBenchmark />;
}
