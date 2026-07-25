import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import type { AppRouteId } from "@/config/routes";
import { hrefFor } from "@/lib/routes";
import { InternalPage, InternalPageHeader } from "../_components/InternalPage";
import { manifest as spamProtectedFormManifest } from "./forms/spam-protected-form/manifest";
import { manifest as riveLogoRevealManifest } from "./loading-screens/rive-logo-reveal/manifest";

type DictionaryFamily = {
	id: string;
	title: string;
	summary: string;
	entries: {
		manifest: {
			id: string;
			title: string;
			summary: string;
			copyTargets: string[];
		};
		routeId: AppRouteId;
	}[];
};

const families: DictionaryFamily[] = [
	{
		id: "loading-screens",
		title: "Loading Screens",
		summary:
			"Reference patterns for intro overlays that own the app-ready signal and exit cleanly.",
		entries: [
			{
				manifest: riveLogoRevealManifest,
				routeId: "dictionaryRiveLogoReveal",
			},
		],
	},
	{
		id: "forms",
		title: "Forms",
		summary:
			"Reference patterns for public forms that need reusable server-side guardrails.",
		entries: [
			{
				manifest: spamProtectedFormManifest,
				routeId: "dictionarySpamProtectedForm",
			},
		],
	},
];

export default function DictionaryIndexPage() {
	return (
		<InternalPage>
			<InternalPageHeader
				title="Dictionary"
				description="Reusable implementation references. The live template remains the source of truth."
			/>

			<div className="grid gap-8">
				{families.map((family) => (
					<section key={family.id} className="grid gap-3">
						<div className="flex max-w-3xl flex-col gap-1">
							<Text as="h2" variant="headingSm">
								{family.title}
							</Text>
							<Text variant="body" tone="muted">
								{family.summary}
							</Text>
						</div>
						<div className="grid gap-4 lg:grid-cols-2">
							{family.entries.map((entry) => (
								<Card key={entry.manifest.id}>
									<Card.Header className="border-b">
										<Card.Title as="h3">{entry.manifest.title}</Card.Title>
										<Card.Description>
											{entry.manifest.summary}
										</Card.Description>
									</Card.Header>
									<Card.Content className="flex flex-col gap-4">
										<div className="flex flex-col gap-2">
											<Text variant="caption" tone="muted">
												Copy targets
											</Text>
											<div className="flex flex-wrap gap-2">
												{entry.manifest.copyTargets.map((target) => (
													<Chip key={target}>{target}</Chip>
												))}
											</div>
										</div>
										<Button
											href={hrefFor(entry.routeId)}
											size="sm"
											variant="secondary"
											className="w-fit"
										>
											Open entry
										</Button>
									</Card.Content>
								</Card>
							))}
						</div>
					</section>
				))}
			</div>
		</InternalPage>
	);
}
