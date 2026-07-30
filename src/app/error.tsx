"use client";

import { StatusErrorState } from "@/app/(site)/_components/status/StatusErrorState";
import { Section } from "@/components/ui/primitives/Section";
import { defaultSurfaceHref } from "@/lib/routes";

export default function AppError({
	error,
	reset,
}: {
	error: globalThis.Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className="h-screen">
			<Section
				className="h-full"
				innerClassName="h-full"
				align="center"
				justify={"center"}
			>
				<StatusErrorState
					error={error}
					reset={reset}
					href={defaultSurfaceHref}
					hrefLabel="Go home"
				/>
			</Section>
		</main>
	);
}
