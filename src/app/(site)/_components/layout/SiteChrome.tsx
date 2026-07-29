import type { ReactNode } from "react";
import ScrollController from "@/components/mount/ScrollController";

type SiteChromeProps = {
	children: ReactNode;
	footer: ReactNode;
	header: ReactNode;
};

/** Owns the shared site-shell order and scroll lifecycle. */
export function SiteChrome({ children, footer, header }: SiteChromeProps) {
	return (
		<>
			{header}
			{children}
			{footer}
			<ScrollController />
		</>
	);
}
