import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { SiteChrome } from "./SiteChrome";
import type { SiteLayoutDocument } from "./siteLayout";

type SiteShellProps = {
	children: ReactNode;
	siteLayout: SiteLayoutDocument;
};

export function SiteShell({ children, siteLayout }: SiteShellProps) {
	return (
		<SiteChrome
			header={<Header layout={siteLayout.header} />}
			footer={
				<Footer
					layout={siteLayout.footer}
					socialLinks={siteLayout.socialLinks}
				/>
			}
		>
			{children}
		</SiteChrome>
	);
}
