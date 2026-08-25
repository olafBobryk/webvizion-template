import type { ReactNode } from "react";
import ScrollController from "@/components/mount/ScrollController";
import { CompositionReviewState } from "./CompositionReviewState";

type SiteChromeProps = {
	children: ReactNode;
	footer: ReactNode;
	header: ReactNode;
};

/** Owns the shared site-shell order and scroll lifecycle. */
export function SiteChrome({ children, footer, header }: SiteChromeProps) {
	return (
		<>
			<CompositionReviewState />
			<div data-site-header-frame>{header}</div>
			<div data-site-composition-frame>
				<div data-site-content>{children}</div>
				<div data-site-footer>{footer}</div>
			</div>
			<ScrollController />
		</>
	);
}
