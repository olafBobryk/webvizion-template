import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import { DashboardSection } from "../../_components/layout/DashboardSection";
import { SupportRequestForm } from "./SupportRequestForm";
import { SupportSurfaceSkeletonView } from "./SupportSurfaceSkeletonView";

export function SupportSurface({
	supportEmail,
	supportMailto,
}: {
	supportEmail: string;
	supportMailto: string;
}) {
	return (
		<DashboardSection contentClassName="grid gap-5" title="Support">
			<Card>
				<Card.Header>
					<Card.Title className="inline-flex items-center gap-2">
						<Icon className="text-muted-foreground" name="mail" size="sm" />
						Email support
					</Card.Title>
					<Card.Description>
						Open your email client for a direct support conversation.
					</Card.Description>
					<Card.Action>
						<Button href={supportMailto} leadingIcon="mail" size="sm">
							Open email
						</Button>
					</Card.Action>
				</Card.Header>
				<Card.Content>
					<div className="grid gap-2">
						<Text tone="muted" variant="support">
							Send a message to{" "}
							<a
								className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
								href={supportMailto}
							>
								{supportEmail}
							</a>
							. Include the route, what you expected, and what happened.
						</Text>
						<Text tone="muted" variant="caption">
							The mail action opens your client; the template does not send
							email.
						</Text>
					</div>
				</Card.Content>
			</Card>
			<SupportRequestForm />
		</DashboardSection>
	);
}

export function SupportSurfaceSkeleton() {
	return <SupportSurfaceSkeletonView />;
}
