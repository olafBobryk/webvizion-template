import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { getDashboardSurfaceById } from "../../_registry/surfaceRegistry";

const referenceDestinations = ["dashboard.reference.skeletons"] as const;
const referenceSurface = getDashboardSurfaceById("dashboard.reference");

function ReferenceContent() {
	return (
		<DashboardSection
			contentClassName="grid gap-4 sm:grid-cols-2"
			description={referenceSurface?.description}
			title={referenceSurface?.label}
		>
			{referenceDestinations.map((surfaceId) => {
				const surface = getDashboardSurfaceById(surfaceId);
				if (!surface) return null;
				return (
					<Card key={surface.id}>
						<Card.Heading
							description={surface.description}
							leading={<Icon name={surface.icon} size="sm" />}
							title={surface.label}
						/>
						<Card.Content>
							<Button href={surface.href} size="sm" variant="secondary">
								Open {surface.label.toLowerCase()}
							</Button>
						</Card.Content>
					</Card>
				);
			})}
		</DashboardSection>
	);
}

export function ReferenceSurface() {
	return <ReferenceContent />;
}

export function ReferenceSurfaceSkeleton() {
	// The hub is entirely static chrome, so its known navigation stays live.
	return <ReferenceContent />;
}
