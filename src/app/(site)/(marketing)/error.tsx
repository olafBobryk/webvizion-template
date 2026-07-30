"use client";

import { StatusErrorState } from "@/app/(site)/_components/status/StatusErrorState";
import { Section } from "@/components/ui/primitives/Section";
import { hrefFor } from "@/lib/routes";

export default function MarketingErrorPage({
	error,
	reset,
}: {
	error: globalThis.Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main>
			<Section height="hero" align="center" justify="center">
				<StatusErrorState
					error={error}
					reset={reset}
					href={hrefFor("marketing.home")}
					hrefLabel="Go home"
				/>
			</Section>
		</main>
	);
}
