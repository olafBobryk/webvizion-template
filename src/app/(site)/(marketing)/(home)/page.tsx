import type { Metadata } from "next";
import { getMarketingPage } from "@/lib/marketing-content/resolvers";
import { MarketingSectionReviewState } from "@/lib/marketing-content/sections/MarketingSectionReviewState";
import { renderMarketingSections } from "@/lib/marketing-content/sections/renderMarketingSections";
import { createMarketingPageMetadata } from "@/lib/metadata";
import { hrefFor } from "@/lib/routes";

type HomeProps = {
	searchParams?: Promise<{
		review?: string | string[];
	}>;
};

const isSectionReviewEnabled = (review: string | string[] | undefined) =>
	Array.isArray(review) ? review.includes("sections") : review === "sections";

export async function generateMetadata(): Promise<Metadata> {
	const page = await getMarketingPage("home");

	return createMarketingPageMetadata({
		description: page.description,
		home: true,
		path: hrefFor("marketing.home"),
		title: page.title,
	});
}

export default async function Home({ searchParams }: HomeProps) {
	const page = await getMarketingPage("home");
	const resolvedSearchParams = await searchParams;
	const reviewSections = isSectionReviewEnabled(resolvedSearchParams?.review);

	return (
		<main>
			<MarketingSectionReviewState enabled={reviewSections} />
			{renderMarketingSections(page.layout)}
		</main>
	);
}
