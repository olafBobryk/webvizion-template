"use client";

import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Icon, type IconName } from "./Icon";
import {
	createIconRegistry,
	IconProvider,
	useIconRegistry,
} from "./iconRegistry";

function RegistryGalleryContent() {
	const registry = useIconRegistry();
	const names = Object.keys(registry).sort() as IconName[];

	return (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
			{names.map((name) => (
				<div
					className="flex min-w-0 items-center gap-2 rounded-lg border border-foreground/10 bg-surface px-3 py-2"
					key={name}
				>
					<Icon aria-hidden name={name} size="sm" />
					<code className="min-w-0 truncate text-2xs text-muted-foreground">
						{name}
					</code>
				</div>
			))}
		</div>
	);
}
function CatalogPreview1() {
	const render = () => (
		<div className="flex items-center gap-4">
			<Icon data-testid="small-icon" name="check" size="sm" />
			<Icon data-testid="medium-icon" frame="default" name="plus" size="md" />
			<Icon data-testid="large-icon" name="arrow-right" size="lg" mirrorInRtl />
			<Icon.Skeleton size="md" />
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => {
		const registry = createIconRegistry({
			"catalog-mark": ({ className, ...props }) => (
				<svg className={className} viewBox="0 0 10 10" {...props}>
					<title>Catalog mark</title>
					<circle cx="5" cy="5" r="4" fill="currentColor" />
				</svg>
			),
		});
		return (
			<IconProvider registry={registry}>
				<Icon data-testid="registry-icon" name="catalog-mark" />
			</IconProvider>
		);
	};
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => <RegistryGalleryContent />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-icons-icon",
	name: "Icon and Registry",
	role: "Canonical named-icon renderer and provider boundary for application and library icon registries.",
	importStatement:
		'import { Icon } from "@/components/ui/icons/Icon";\nimport { createIconRegistry, IconProvider, useIconRegistry } from "@/components/ui/icons/iconRegistry";\nimport { phosphorIconRegistry } from "@/components/ui/icons/phosphorRegistry";',
	chooseWhen: [
		"A component needs a shared glyph, shared sizing, optional framing, or a registry extension.",
	],
	chooseInstead: [
		"Use IconSwap when a control transitions between multiple icon states.",
	],
	compounds: [
		"Icon.Skeleton",
		"IconProvider",
		"createIconRegistry",
		"useIconRegistry",
		"phosphorIconRegistry",
	],
	exclusions: [
		"Direct imports from raw registry maps.",
		"A separate catalogue identity for Icon.Skeleton.",
		"Inline SVG when the registry already owns the symbol.",
	],
	guarantees: [
		{
			label: "Sizes, framing, and decorative semantics",
			storyId: "ui-icons-icon--sizes-frames-and-semantics",
		},
		{
			label: "Registry extension",
			storyId: "ui-icons-icon--registry-extension",
		},
		{
			label: "Registry-backed named-icon gallery",
			storyId: "ui-icons-icon--registry-gallery",
		},
	],

	family: "UI",
	group: "Icons",
	previewTargets: [
		{
			id: "sizes-frames-and-semantics",
			name: "Sizes, framing, and decorative semantics",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "registry-extension",
			name: "Registry extension",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "registry-gallery",
			name: "Registry-backed named-icon gallery",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
