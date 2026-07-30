import { StatusContent } from "@/app/(site)/_components/status/StatusContent";
import { Button } from "@/components/ui/primitives/Button";
import { hrefFor } from "@/lib/routes";

export function DashboardUnauthenticatedFallback({
	loginHref = hrefFor("auth.login"),
}: {
	loginHref?: string;
}) {
	return (
		<div className="flex items-center justify-center w-full h-full">
			<StatusContent
				heading="Redirecting to login"
				body="Dashboard routes require an authenticated session, so the template is sending you to the dedicated auth shell."
				enableRevealMotion={false}
				actions={
					<Button variant="primary" href={loginHref}>
						Go to login
					</Button>
				}
			/>
		</div>
	);
}
