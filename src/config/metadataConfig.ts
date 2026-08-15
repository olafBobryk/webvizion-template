import type { Metadata } from "next";
import { appSurfaceRegistry } from "@/config/surfaces";
import type { RouteSurfaceFamily } from "@/lib/surfaces/routeSurface";

type RouteSurfaceId = `${RouteSurfaceFamily}.${string}`;

export type StaticPageMetadataConfig = {
	description: string;
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

const staticPageMetadataDefinitions = {
	"marketing.contact": {
		description: "Choose the contact channel or form that fits this project.",
		title: "Contact",
	},
	"marketing.settings": {
		description:
			"Manage appearance and accessibility preferences for this application.",
		title: "Settings",
	},
	"marketing.repositoryFootprint": {
		description:
			"Explore the authored repository history measured as files, text, and tokens.",
		title: "Repository Footprint",
	},
} satisfies Partial<Record<RouteSurfaceId, StaticPageMetadataConfig>>;

export type StaticPageMetadataKey = keyof typeof staticPageMetadataDefinitions;

const installedSurfaceIds = new Set<string>(
	appSurfaceRegistry.map((surface) => surface.id),
);

export const staticPageMetadata = Object.fromEntries(
	Object.entries(staticPageMetadataDefinitions).filter(([surfaceId]) =>
		installedSurfaceIds.has(surfaceId),
	),
) as Partial<Record<StaticPageMetadataKey, StaticPageMetadataConfig>>;

export const marketingDocumentSurfaceIds = ["marketing.home"] as const;

export const KEYWORDS = siteMetadata.keywords;
