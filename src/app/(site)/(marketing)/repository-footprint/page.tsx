import type { Metadata } from "next";
import { Section } from "@/components/ui/primitives/Section";
import { Text } from "@/components/ui/primitives/Text";
import { createStaticMarketingPageMetadata } from "@/lib/metadata";
import footprint from "./_data/repository-footprint.json";
import { RepositoryFootprintCharts } from "./RepositoryFootprintCharts";

export const metadata: Metadata = createStaticMarketingPageMetadata(
	"marketing.repositoryFootprint",
);

export default function RepositoryFootprintPage() {
	return (
		<main>
			<Section maxWidth="wide" padding="hero" innerClassName="gap-8">
				<header className="flex max-w-3xl flex-col gap-2">
					<Text as="h1" variant="headingLg">
						Repository Footprint
					</Text>
					<Text tone="muted">
						Authored repository history measured as files, text, and tokens.
					</Text>
				</header>
				<RepositoryFootprintCharts snapshots={footprint.snapshots} />
			</Section>
		</main>
	);
}
