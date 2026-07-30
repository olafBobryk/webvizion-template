import { StatusContent } from "@/app/(site)/_components/status/StatusContent";
import { Button } from "@/components/ui/primitives/Button";
import { getOptionalSurfaceHref, hrefFor } from "@/lib/routes";

export function DashboardLoadingFallback() {
	return (
		<div className="flex items-center justify-center w-full h-full">
			<StatusContent
				heading="Checking dashboard access"
				body="Please wait while the template validates the current dashboard session."
				enableRevealMotion={false}
			/>
		</div>
	);
}

export function DashboardBannedFallback() {
	return (
		<div className="flex items-center justify-center w-full h-full">
			<StatusContent
				heading="Dashboard access restricted"
				body="This mock account is marked as restricted. Use another session or return to the site shell."
				enableRevealMotion={false}
				actions={
					<>
						<Button variant="primary" href={hrefFor("auth.login")}>
							Go to login
						</Button>
						<Button
							variant="secondary"
							href={
								getOptionalSurfaceHref("marketing.home") ??
								hrefFor("dashboard.overview")
							}
						>
							Back to site
						</Button>
					</>
				}
			/>
		</div>
	);
}

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
