import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { hrefFor } from "@/lib/routes";
import {
	InternalPage,
	InternalPageHeader,
} from "../../../_components/InternalPage";
import { SpamProtectedFormPreview } from "./_source/SpamProtectedFormPreview";
import { manifest } from "./manifest";

export default function SpamProtectedFormDictionaryPage() {
	return (
		<InternalPage>
			<InternalPageHeader
				title={manifest.title}
				description={manifest.summary}
			/>

			<SpamProtectedFormPreview />

			<Card>
				<Card.Header className="border-b">
					<Card.Title>Implementation notes</Card.Title>
				</Card.Header>
				<Card.Content className="grid gap-5">
					<div className="flex flex-wrap gap-2">
						{manifest.adaptationPoints.map((point) => (
							<Chip key={point}>{point}</Chip>
						))}
					</div>
					<ul className="grid gap-2 text-muted-foreground">
						{manifest.notes.map((note) => (
							<li key={note}>{note}</li>
						))}
					</ul>
					<Button href={hrefFor("dictionary")} size="sm" variant="secondary">
						Back to dictionary
					</Button>
				</Card.Content>
			</Card>
		</InternalPage>
	);
}
