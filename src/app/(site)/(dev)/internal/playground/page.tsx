import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import { InternalPage, InternalPageHeader } from "../_components/InternalPage";

const playgroundGroups = [
	{
		id: "repository",
		title: "Repository",
		description: "Local tools for inspecting this template's own history.",
		links: [
			{
				href: "/internal/playground/commit-history",
				title: "Commit History",
				description:
					"Explore per-commit line deltas and cumulative net lines with a linked date navigator.",
			},
		],
	},
	{
		id: "motion",
		title: "Motion",
		description: "Loose prototypes for reveal, scroll, and choreography ideas.",
		links: [
			{
				href: "/internal/playground/toasts",
				title: "Toast Hierarchy",
				description:
					"Typography and indicator comparisons for transient feedback.",
			},
			{
				href: "/internal/playground/motion",
				title: "Motion System QA",
				description:
					"Scoped motion character, timing moments, reveal primitives, and automation checks.",
			},
		],
	},
];

export default function PlaygroundIndexPage() {
	return (
		<InternalPage>
			<InternalPageHeader
				title="Playground"
				description="Focused experiments that have not moved into the component catalog."
			/>

			<div className="grid gap-8">
				{playgroundGroups.map((group) => (
					<section key={group.id} className="grid gap-3">
						<div className="flex max-w-3xl flex-col gap-1">
							<Text as="h2" variant="headingSm">
								{group.title}
							</Text>
							<Text variant="body" tone="muted">
								{group.description}
							</Text>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							{group.links.map((link) => (
								<Card key={link.href}>
									<Card.Content className="flex h-full flex-col gap-4">
										<div className="flex flex-1 flex-col gap-1">
											<Card.Title as="h3">{link.title}</Card.Title>
											<Text variant="body" tone="muted">
												{link.description}
											</Text>
										</div>
										<Button
											href={link.href}
											size="sm"
											variant="secondary"
											className="w-fit"
										>
											Open playground
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
