import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import Logo from "./Logo";

function CatalogPreview1() {
	return (
		<div className="grid gap-6">
			<div className="flex flex-wrap items-end gap-6">
				{(["sm", "md", "lg"] as const).map((size) => (
					<Logo aria-label={`${size} full logo`} key={size} size={size} />
				))}
			</div>
			<div className="flex flex-wrap items-end gap-6">
				{(["sm", "md", "lg"] as const).map((size) => (
					<Logo
						aria-label={`${size} logo mark`}
						key={size}
						size={size}
						variant="mark"
					/>
				))}
			</div>
		</div>
	);
}

function CatalogPreview2() {
	return (
		<div className="grid gap-4 sm:grid-cols-3">
			<div className="flex min-h-24 items-center justify-center rounded-lg bg-background p-5">
				<Logo aria-label="Dark logo on light surface" tone="dark" />
			</div>
			<div className="flex min-h-24 items-center justify-center rounded-lg bg-background p-5">
				<Logo aria-label="Muted logo on light surface" tone="muted" />
			</div>
			<div className="flex min-h-24 items-center justify-center rounded-lg bg-foreground p-5">
				<Logo aria-label="Light logo on dark surface" tone="light" />
			</div>
		</div>
	);
}

function CatalogPreview3() {
	return (
		<div className="flex flex-wrap items-center gap-6">
			<Logo aria-label="Homepage brand link" href="/" />
			<Logo
				aria-label="Standalone brand mark"
				as="span"
				href=""
				interactive={false}
				variant="mark"
			/>
		</div>
	);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "branding-logo",
	name: "Logo",
	role: "Canonical product wordmark and mark for linked or presentational brand identity.",
	importStatement: 'import Logo from "@/components/branding/Logo";',
	chooseWhen: [
		"A header, footer, modal, call to action, or other shell surface needs the product wordmark or mark.",
		"Brand navigation should link to the homepage with shared sizing, tone, and focus behavior.",
	],
	chooseInstead: [
		"Use ordinary Text for product names that are content rather than brand identity.",
		"Use the Icon owner for interface glyphs and action symbols.",
	],
	compounds: ["Full wordmark variant", "Mark variant"],
	exclusions: [
		"Rebuilding the wordmark with raw text or page-local SVG.",
		"Page-specific focus, hover, or sizing recipes for the product logo.",
		"Wrapping Logo in another interactive element; use its semantic rendering API.",
	],
	guarantees: [
		{
			label: "Wordmark and mark sizes",
			storyId: "branding-logo--variants-sizes-and-tones",
		},
		{
			label: "Surface-aware tones",
			storyId: "branding-logo--surface-tones",
		},
		{
			label: "Linked and presentational semantics",
			storyId: "branding-logo--semantic-rendering",
		},
	],
	family: "Branding",
	group: "Identity",
	previewTargets: [
		{
			id: "variants-sizes-and-tones",
			name: "Wordmark and mark sizes",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "surface-tones",
			name: "Surface-aware tones",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "semantic-rendering",
			name: "Linked and presentational semantics",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
	],
});
