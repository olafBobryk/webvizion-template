import Logo from "@/components/branding/Logo";
import { SocialLinks } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import type { SiteLayoutDocument } from "./siteLayout";
import { getSiteLinkHref } from "./siteLayout";

export default function Footer({
	className = "",
	layout,
	socialLinks,
}: {
	className?: string;
	layout: SiteLayoutDocument["footer"];
	socialLinks: SiteLayoutDocument["socialLinks"];
}) {
	return (
		<footer
			className={
				"flex flex-col items-center py-section-y px-section-x border-t border-white/[0.15] " +
				className
			}
		>
			<div className="flex flex-col justify-center items-center max-w-section-max relative gap-[25px] ">
				<Logo size="md" />
				<div className="flex justify-center gap-y-[10px] flex-wrap items-center self-stretch flex-grow-0 flex-shrink-0 relative gap-[45px] p-2.5">
					{layout.navLinks.map((item) => (
						<Button
							href={getSiteLinkHref(item)}
							key={`${item.label}-${getSiteLinkHref(item)}`}
							size="none"
							variant="ghost"
							className="text-sm font-medium"
						>
							{item.label}
						</Button>
					))}
				</div>
				{socialLinks.length > 0 ? (
					<SocialLinks
						className="flex-grow-0 flex-shrink-0 justify-center gap-2.5"
						iconSize={15}
						links={socialLinks}
						presentation="footer"
						size="icon"
						variant="secondary"
					/>
				) : null}
			</div>
		</footer>
	);
}
