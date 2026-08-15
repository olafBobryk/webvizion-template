import * as Markdown from "@/components/composites/markdown";
import Divider from "@/components/ui/primitives/Divider";
import { Section } from "@/components/ui/primitives/Section";
import { Text } from "@/components/ui/primitives/Text";
import { DateIndicator } from "@/components/ui/time/DateIndicator";

export type DocumentPageProps = {
	date: Date | string | number;
	markdown: string;
	title: string;
};

export function DocumentPage({ date, markdown, title }: DocumentPageProps) {
	return (
		<main data-slot="document-page">
			<Section maxWidth="narrow" padding="hero">
				<article className="grid gap-8 sm:gap-10">
					<header
						className="grid gap-4 sm:gap-6"
						data-slot="document-page-header"
					>
						<DateIndicator
							date={date}
							interactive={false}
							leadingText="Updated"
							tone="muted"
							variant="caption"
						/>
						<Text as="h1" interactive={false} variant="heading2xxl">
							{title}
						</Text>
					</header>
					<div data-slot="document-page-divider">
						<Divider />
					</div>
					<Markdown.Render markdown={markdown} variant="result" />
				</article>
			</Section>
		</main>
	);
}
