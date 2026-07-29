import Logo from "@/components/branding/Logo";
import { Button } from "@/components/ui/primitives/Button";
import type { SiteLayoutDocument } from "./siteLayout";
import { getSiteLinkHref } from "./siteLayout";

export default function Footer({
	layout,
}: {
	layout: SiteLayoutDocument["footer"];
	socialLinks?: SiteLayoutDocument["socialLinks"];
}) {
	return (
		<footer className="border-t border-border px-section-x py-10">
			<div className="mx-auto flex max-w-section-max flex-col items-center gap-6">
				<Logo size="sm" />
				<div className="flex flex-wrap justify-center gap-2">
					{layout.navLinks.map((item) => (
						<Button
							key={item.label}
							href={getSiteLinkHref(item)}
							size="none"
							variant="ghost"
							className="text-sm font-medium"
						>
							{item.label}
						</Button>
					))}
				</div>
			</div>
		</footer>
	);
}
