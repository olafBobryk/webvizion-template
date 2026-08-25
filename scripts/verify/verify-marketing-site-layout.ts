import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { templateCapabilities } from "@/config/capabilities";
import { fallbackSiteLayout } from "@/lib/marketing-content/fallback";
import {
	normalizePayloadSiteLayout,
	serializeSiteLayoutForPayload,
} from "@/lib/marketing-content/payloadSiteLayout";

const siteChromeSource = readFileSync(
	resolve(process.cwd(), "src/app/(site)/_components/layout/SiteChrome.tsx"),
	"utf8",
);
for (const boundary of [
	"data-site-header-frame",
	"data-site-composition-frame",
	"data-site-content",
	"data-site-footer",
]) {
	assert.match(
		siteChromeSource,
		new RegExp(boundary, "u"),
		`SiteChrome must retain the ${boundary} review boundary.`,
	);
}
assert.match(
	siteChromeSource,
	/<CompositionReviewState\s*\/>/u,
	"SiteChrome must own the automation-only composition review state.",
);

const serialized = serializeSiteLayoutForPayload(fallbackSiteLayout);
assert.deepStrictEqual(
	normalizePayloadSiteLayout(serialized),
	fallbackSiteLayout,
);

assert.ok(
	fallbackSiteLayout.socialLinks.length === 0 ||
		fallbackSiteLayout.socialLinks.length === 4,
	"The site layout must use either the canonical public links or an explicit empty profile override.",
);
if (fallbackSiteLayout.socialLinks.length > 0) {
	assert.deepStrictEqual(
		fallbackSiteLayout.socialLinks.map(({ href, label }) => ({ href, label })),
		[
			{
				href: "https://github.com/olafBobryk/averlo-next-template",
				label: "GitHub",
			},
			{
				href: "https://www.instagram.com/averlo.co/",
				label: "Instagram",
			},
			{ href: "https://www.tiktok.com/@averloagency", label: "TikTok" },
			{
				href: "https://www.linkedin.com/company/averlo",
				label: "LinkedIn",
			},
		],
	);
}

const unavailableOptionalSurface = structuredClone(serialized);
unavailableOptionalSurface.header.topNavLinks.push({
	kind: "surface",
	label: "Unavailable",
	surfaceId: "marketing.not-installed",
});
assert.equal(
	normalizePayloadSiteLayout(
		unavailableOptionalSurface,
	).header.topNavLinks.some((link) => link.label === "Unavailable"),
	false,
);

const unavailableRequiredSurface = structuredClone(serialized);
unavailableRequiredSurface.header.cta = {
	kind: "surface",
	label: "Unavailable",
	surfaceId: "marketing.not-installed",
};
assert.throws(
	() => normalizePayloadSiteLayout(unavailableRequiredSurface),
	/unavailable required surface/,
);

const ambiguousLink = structuredClone(serialized);
ambiguousLink.header.cta = {
	href: "/also-defined",
	kind: "surface",
	label: "Ambiguous",
	surfaceId: "marketing.home",
};
assert.throws(
	() => normalizePayloadSiteLayout(ambiguousLink),
	/cannot define both/,
);

assert.deepStrictEqual(
	normalizePayloadSiteLayout(serialized).header.navLinks[0]?.sections?.[0],
	{
		description: "Primary home page introduction.",
		href: "/#home-hero",
		label: "Hero",
	},
);

const templateMenuGroup = fallbackSiteLayout.header.menuGroups.find(
	(group) => group.label === "Template",
);
assert.deepStrictEqual(
	templateMenuGroup?.links,
	templateCapabilities.repositoryFootprint
		? [{ href: "/repository-footprint", label: "Repository Footprint" }]
		: undefined,
);
for (const link of [
	...fallbackSiteLayout.header.navLinks,
	...fallbackSiteLayout.header.topNavLinks,
	...fallbackSiteLayout.footer.navLinks,
]) {
	assert.notEqual(
		link.href,
		"/repository-footprint",
		"Repository Footprint belongs only in the canonical header menu.",
	);
}

console.log("Marketing site-layout fallback and Payload mapping verified.");
