import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { InternalPage, InternalPageHeader } from "../_components/InternalPage";

const REFERENCE_LINKS = [
	{
		title: "Real Favicon Generator",
		summary:
			"Generate a favicon set, pinned assets, and manifest files before copying the final outputs into `public/`.",
		href: "https://realfavicongenerator.net/",
	},
];

export default function ReferencePage() {
	return (
		<InternalPage>
			<InternalPageHeader
				title="Reference"
				description="External tools and operational links used while maintaining the template."
			/>

			<div className="grid gap-4 md:grid-cols-2">
				{REFERENCE_LINKS.map((link) => (
					<Card key={link.href}>
						<Card.Content className="flex h-full flex-col gap-4">
							<div className="flex flex-1 flex-col gap-1">
								<Card.Title>{link.title}</Card.Title>
								<Card.Description>{link.summary}</Card.Description>
							</div>
							<Button
								href={link.href}
								rel="noreferrer"
								size="sm"
								target="_blank"
								variant="secondary"
								className="w-fit"
							>
								Open link
							</Button>
						</Card.Content>
					</Card>
				))}
			</div>
		</InternalPage>
	);
}
