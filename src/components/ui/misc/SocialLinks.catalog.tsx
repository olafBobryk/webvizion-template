"use client";

import { type ComponentType, createElement } from "react";
import {
	createIconRegistry,
	IconProvider,
} from "@/components/ui/icons/iconRegistry";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SocialLinks } from "./SocialLinks";

const links = [
	{
		href: "https://github.com/olafBobryk/averlo-next-template",
		label: "GitHub",
	},
	{ href: "https://www.instagram.com/averlo.co/", label: "Instagram" },
	{ href: "https://www.tiktok.com/@averloagency", label: "TikTok" },
	{ href: "https://www.linkedin.com/company/averlo", label: "LinkedIn" },
] as const;
const iconWeightRegistry = createIconRegistry({
	github: ({ className, weight, "aria-hidden": ariaHidden }) => (
		<svg
			aria-hidden={ariaHidden}
			className={className}
			data-icon-weight={weight}
			viewBox="0 0 16 16"
		>
			<title>GitHub</title>
			<circle cx="8" cy="8" fill="currentColor" r="7" />
		</svg>
	),
});
function CatalogPreview1() {
	return createElement(
		SocialLinks as unknown as ComponentType<Record<string, unknown>>,
		{
			...{ links: [...links] },
			...{},
		},
	);
}
function CatalogPreview2() {
	const render = () => (
		<div className="grid gap-4">
			<SocialLinks links={[...links]} showLabels />
			<SocialLinks.Skeleton showLabels count={3} />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{ links: [...links] }, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
		<IconProvider registry={iconWeightRegistry}>
			<div className="flex gap-4">
				<SocialLinks links={[links[0]]} />
				<SocialLinks iconWeight="regular" links={[links[0]]} />
			</div>
		</IconProvider>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{ links: [...links] }, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-misc-social-links",
	name: "SocialLinks",
	role: "Shared social/profile link cluster backed by the icon registry.",
	importStatement: 'import { SocialLinks } from "@/components/ui/misc";',
	chooseWhen: [
		"A reusable cluster of social or profile destinations is needed.",
	],
	chooseInstead: ["Use Button links for unrelated actions or destinations."],
	compounds: ["SocialLinks.Skeleton"],
	exclusions: ["Product-local social icon maps and icon-button rows."],
	guarantees: [
		{
			label: "Icon-only accessible names and external links",
			storyId: "ui-misc-social-links--link-contract",
		},
		{
			label: "Label and skeleton modes",
			storyId: "ui-misc-social-links--label-and-skeleton",
		},
		{
			label: "Filled icon default and weight override",
			storyId: "ui-misc-social-links--filled-icon-weight",
		},
	],

	family: "UI",
	group: "Misc",
	previewTargets: [
		{
			id: "link-contract",
			name: "Icon-only accessible names and external links",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "label-and-skeleton",
			name: "Label and skeleton modes",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "filled-icon-weight",
			name: "Filled icon default and weight override",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
