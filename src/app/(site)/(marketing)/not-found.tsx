import { StatusContent } from "@/app/(site)/_components/status/StatusContent";
import { Button } from "@/components/ui/primitives/Button";
import { Section } from "@/components/ui/primitives/Section";
import { hrefFor } from "@/lib/routes";

export default function MarketingNotFoundPage() {
	return (
		<main>
			<Section height={"hero"} align="center" justify="center">
				<StatusContent
					heading="Page not found"
					body="The page you’re looking for doesn’t exist."
					actions={
						<Button variant="primary" href={hrefFor("marketing.home")}>
							Go home
						</Button>
					}
				/>
			</Section>
		</main>
	);
}
