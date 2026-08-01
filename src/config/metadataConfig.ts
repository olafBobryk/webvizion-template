import "server-only";

import type { Metadata } from "next";
import type { RouteSurfaceFamily } from "@/lib/surfaces/routeSurface";

type RouteSurfaceId = `${RouteSurfaceFamily}.${string}`;

export type StaticPageMetadataConfig = {
	absoluteTitle?: boolean;
	description: string;
	path: string;
	title: string;
};

export type SiteMetadataConfig = {
	baseUrl?: string;
	defaultDescription: string;
	icons?: Metadata["icons"];
	keywords: string[];
	manifest?: string;
	name: string;
};

const siteBaseUrl = process.env.SITE_URL?.trim() || undefined;

export const siteMetadata = {
	name: "Averlo Next Template",
	baseUrl: siteBaseUrl,
	defaultDescription:
		"An agent-ready Next.js template for lightweight design-system scaffolds.",
	keywords: ["agency", "template"],
	icons: {
		icon: "/icon.svg",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
} satisfies SiteMetadataConfig;

export const staticPageMetadata = {
	"marketing.home": {
		title: siteMetadata.name,
		description: siteMetadata.defaultDescription,
		path: "/",
		absoluteTitle: true,
	},
} satisfies Partial<Record<RouteSurfaceId, StaticPageMetadataConfig>>;

export type StaticPageMetadataKey = keyof typeof staticPageMetadata;

export const KEYWORDS = siteMetadata.keywords;
