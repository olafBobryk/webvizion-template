import { HealthCheckIndicator } from "@/components/ui/misc";

export function AuthShell({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<main className="flex min-h-dvh flex-col bg-background px-4 py-12 text-foreground">
			<div className="flex flex-1 items-center justify-center">
				<div className="w-full max-w-md">{children}</div>
			</div>
			<div className="flex justify-center pt-6">
				<HealthCheckIndicator service="auth" />
			</div>
		</main>
	);
}
