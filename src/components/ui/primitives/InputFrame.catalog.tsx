"use client";

import clsx from "clsx";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import {
	InputFrame,
	inputFrameChromeClassName,
	inputVariants,
} from "./InputFrame";

function CatalogPreview1() {
	const render = () => (
		<div className="grid gap-4">
			<InputFrame
				start={<span aria-hidden>€</span>}
				end={<span>EUR</span>}
				fullWidth
				size="sm"
			>
				<input
					aria-label="Small amount"
					className={inputVariants({
						size: "sm",
						hasStart: true,
						hasEnd: true,
					})}
				/>
			</InputFrame>
			<InputFrame fullWidth size="md">
				<input
					aria-label="Medium input"
					className={inputVariants({ size: "md" })}
				/>
			</InputFrame>
			<InputFrame fullWidth size="lg">
				<input
					aria-label="Large input"
					className={inputVariants({ size: "lg" })}
				/>
			</InputFrame>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<InputFrame data-testid="error-frame" fullWidth tone="error">
			<input
				aria-label="Invalid value"
				aria-invalid="true"
				className={inputVariants()}
			/>
		</InputFrame>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview3() {
	const render = () => (
		<div className="grid gap-4">
			<InputFrame disabled fullWidth>
				<input
					aria-label="Disabled value"
					className={inputVariants({ disabled: true })}
					disabled
					defaultValue="Unavailable"
				/>
			</InputFrame>
			<InputFrame.Skeleton fullWidth>Loading value</InputFrame.Skeleton>
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview4() {
	const render = () => (
		<div
			className={clsx(inputFrameChromeClassName, "min-h-9 px-3 py-2")}
			data-testid="static-framed-content"
		>
			Non-interactive content
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-primitives-input-frame",
	name: "InputFrame",
	role: "Visual chrome and focus shell for text-like controls, static chrome reuse, and input skeletons.",
	importStatement:
		'import { InputFrame, inputFrameChromeClassName } from "@/components/ui/primitives/InputFrame";',
	chooseWhen: [
		"A real focusable input needs shared framing, size, adornment spacing, disabled/error treatment, or skeleton parity.",
		"A static domain surface deliberately needs InputFrame-equivalent neutral chrome without input or focus semantics.",
	],
	chooseInstead: [
		"Application code should prefer a finished text-like input that already composes InputFrame.",
	],
	compounds: ["InputFrame.Skeleton"],
	exclusions: [
		"Treating the frame itself as the semantic input.",
		"Cataloguing inputVariants or direct skeleton implementations as owners.",
		"Applying InputFrame focus, tone, disabled, transition, or adornment behavior to static chrome reuse.",
	],
	guarantees: [
		{
			label: "Sizes and adornments",
			storyId: "ui-primitives-input-frame--sizes-and-adornments",
		},
		{
			label: "Focus and error state",
			storyId: "ui-primitives-input-frame--focus-and-error-state",
		},
		{
			label: "Disabled and skeleton parity",
			storyId: "ui-primitives-input-frame--disabled-and-skeleton-parity",
		},
		{
			label: "Static chrome reuse",
			storyId: "ui-primitives-input-frame--static-chrome-reuse",
		},
	],

	family: "UI",
	group: "Primitives",
	previewTargets: [
		{
			id: "sizes-and-adornments",
			name: "Sizes and adornments",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "focus-and-error-state",
			name: "Focus and error state",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
		{
			id: "disabled-and-skeleton-parity",
			name: "Disabled and skeleton parity",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview3,
		},
		{
			id: "static-chrome-reuse",
			name: "Static chrome reuse",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview4,
		},
	],
});
