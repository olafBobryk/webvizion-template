import { Card, Float, Panel } from "@/components/ui/primitives/surfaces";
import { Text } from "@/components/ui/primitives/Text";
import {
	InternalPage,
	InternalPageHeader,
} from "../../_components/InternalPage";

export default function SurfaceElevationPlaygroundPage() {
	return (
		<InternalPage className="gap-10" maxWidth="wide">
			<InternalPageHeader
				description="The semantic Page → Panel → Card → Float system using shadcn's restrained shadow utility scale. Structure, spacing, radius, and interaction ownership remain Averlo-owned."
				title="Surface elevation baseline"
			/>

			<section
				aria-label="Official surface elevation baseline"
				className="grid gap-8 bg-background"
				data-surface-role="page"
			>
				<div className="grid gap-4 lg:grid-cols-4">
					<section
						aria-label="Page specimen"
						className="grid min-h-48 content-start gap-1 border border-dashed border-border bg-background p-6"
						data-surface-role="page"
					>
						<Text variant="bodyStrong">Page</Text>
						<Text tone="muted" variant="caption">
							Canvas · no radius · no shadow
						</Text>
					</section>

					<Panel aria-label="Panel specimen" padding="md">
						<Text variant="bodyStrong">Panel</Text>
						<Text tone="muted" variant="caption">
							Broad grouping · shadow-none
						</Text>
					</Panel>

					<Card aria-label="Card specimen">
						<Card.Heading
							description="Structured unit · shadow-sm"
							title="Card"
						/>
						<Card.Content>Slots and spacing remain Card-owned.</Card.Content>
					</Card>

					<Float aria-label="Float specimen" padding="md">
						<div className="grid gap-1">
							<Text variant="bodyStrong">Float</Text>
							<Text tone="muted" variant="caption">
								Temporary chrome · shadow-md
							</Text>
						</div>
					</Float>
				</div>

				<Panel className="relative min-h-96 overflow-hidden" padding="lg">
					<div className="grid gap-1">
						<Text variant="bodyStrong">Composed hierarchy</Text>
						<Text tone="muted" variant="caption">
							Overlay is context, so its visual surface remains a Card.
						</Text>
					</div>
					<Card className="max-w-xl">
						<Card.Heading
							description="Default card elevation · shadow-sm"
							title="Card in Panel"
						/>
					</Card>
					<Float className="absolute top-28 right-8" padding="sm">
						<Text variant="support">Float · shadow-md</Text>
					</Float>
					<div className="absolute right-12 bottom-8 w-72">
						<Card elevation="overlay" size="sm">
							<Card.Content className="grid gap-1">
								<Card.Title as="h3">Overlay context</Card.Title>
								<Card.Description>Card · shadow-lg</Card.Description>
							</Card.Content>
						</Card>
					</div>
				</Panel>
			</section>
		</InternalPage>
	);
}
