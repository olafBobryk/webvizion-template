import type { Metadata } from "next";
import {
	type StaticPageMetadataConfig,
	type StaticPageMetadataKey,
	siteMetadata,
	staticPageMetadata,
} from "@/config/metadataConfig";
import { hrefFor, type StaticAppSurfaceId } from "@/lib/routes";

type RouteMetadataInput = {
	description: string;
	path: string;
	title: string;
};

function getMetadataBase() {
	if (!siteMetadata.baseUrl) return undefined;

	try {
		return new URL(siteMetadata.baseUrl);
	} catch {
		return undefined;
	}
}

function getAbsoluteUrl(path: string) {
	const metadataBase = getMetadataBase();
	return metadataBase ? new URL(path, metadataBase).toString() : undefined;
}

export function createRootMetadata(): Metadata {
	const metadataBase = getMetadataBase();

	return {
		...(metadataBase ? { metadataBase } : {}),
		title: {
			default: siteMetadata.name,
			template: `%s | ${siteMetadata.name}`,
		},
		description: siteMetadata.defaultDescription,
		keywords: [...siteMetadata.keywords],
		icons: siteMetadata.icons,
		manifest: siteMetadata.manifest,
		robots: {
			index: true,
			follow: true,
		},
		openGraph: {
			type: "website",
			siteName: siteMetadata.name,
			title: siteMetadata.name,
			description: siteMetadata.defaultDescription,
			...(metadataBase ? { url: metadataBase.toString() } : {}),
		},
		twitter: {
			card: "summary",
			title: siteMetadata.name,
			description: siteMetadata.defaultDescription,
		},
	};
}

function createRouteMetadata({
	description,
	index,
	path,
	title,
}: RouteMetadataInput & { index: boolean }): Metadata {
	const canonicalUrl = getAbsoluteUrl(path);

	return {
		title: { absolute: title },
		description,
		alternates: {
			canonical: path,
		},
		robots: {
			index,
			follow: index,
		},
		openGraph: {
			title,
			description,
			siteName: siteMetadata.name,
			...(canonicalUrl ? { url: canonicalUrl } : {}),
		},
		twitter: {
			card: "summary",
			title,
			description,
		},
	};
}

export function createPrivateRouteMetadata({
	description,
	path,
	title,
}: RouteMetadataInput): Metadata {
	return createRouteMetadata({
		description,
		index: false,
		path,
		title: `${title} | ${siteMetadata.name}`,
	});
}

export function createMarketingPageMetadata({
	description,
	home = false,
	path,
	title,
}: RouteMetadataInput & { home?: boolean }): Metadata {
	return createRouteMetadata({
		description,
		index: true,
		path,
		title: home ? siteMetadata.name : `${siteMetadata.name} | ${title}`,
	});
}

export function createStaticMarketingPageMetadata(
	key: StaticPageMetadataKey,
): Metadata {
	const value: StaticPageMetadataConfig | undefined = staticPageMetadata[key];
	if (!value) {
		throw new Error(`Static metadata is not installed for ${key}.`);
	}

	return createMarketingPageMetadata({
		...value,
		path: hrefFor(key as StaticAppSurfaceId),
	});
}
