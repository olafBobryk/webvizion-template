import { StatusContent } from "@/app/(site)/_components/status/StatusContent";
import { Button } from "@/components/ui/primitives/Button";
import { Section } from "@/components/ui/primitives/Section";
import { defaultSurfaceHref } from "@/lib/routes";

export default function Page() {
	return (
		<main className="h-screen">
			<Section
				className="h-full"
				innerClassName="h-full"
				align="center"
				justify={"center"}
			>
				<StatusContent
					heading="Page not found"
					body="The page you’re looking for doesn’t exist."
					actions={
						<Button variant="primary" href={defaultSurfaceHref}>
							Go home
						</Button>
					}
				/>
			</Section>
		</main>
	);
}
