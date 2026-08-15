import type { Metadata } from "next";
import { DocumentPage as DocumentPageOwner } from "@/components/domain/marketing";
import { getMarketingPage } from "@/lib/marketing-content/resolvers";
import { createMarketingPageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
	const page = await getMarketingPage("document");

	return createMarketingPageMetadata({
		description: page.description,
		path: "/document",
		title: page.title,
	});
}

export default async function DocumentPage() {
	const page = await getMarketingPage("document");
	const [document] = page.layout;

	return (
		<DocumentPageOwner
			date={document.date}
			markdown={document.markdown}
			title={page.title}
		/>
	);
}
