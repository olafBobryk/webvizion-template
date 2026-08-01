const DEFAULT_SITE_URL = "http://localhost:3000";

function ensureProtocol(siteUrl) {
	return /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`;
}

function normalizeSiteUrl(siteUrl) {
	const url = new URL(ensureProtocol(siteUrl));
	const normalizedPath =
		url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
	return `${url.origin}${normalizedPath}/`;
}

function resolveSiteUrl() {
	const candidates = [
		process.env.SITE_URL,
		process.env.VERCEL_PROJECT_PRODUCTION_URL,
		process.env.VERCEL_URL,
		DEFAULT_SITE_URL,
	];

	return (
		candidates.find((candidate) => Boolean(candidate?.trim())) ??
		DEFAULT_SITE_URL
	);
}

const siteUrl = normalizeSiteUrl(resolveSiteUrl());

function isExcludedPath(path) {
	return (
		path === "/settings" ||
		path === "/internal" ||
		path.startsWith("/internal/") ||
		/\.(png|svg|json|xml|txt|ico)$/i.test(path)
	);
}

module.exports = {
	siteUrl,
	generateRobotsTxt: true,
	changefreq: "weekly",
	priority: 0.7,
	sitemapSize: 5000,
	transform: async (config, path) => {
		if (isExcludedPath(path)) {
			return null;
		}

		return {
			loc: path,
			changefreq: path === "/" ? "weekly" : config.changefreq,
			priority: path === "/" ? 1 : config.priority,
			lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
		};
	},
};
