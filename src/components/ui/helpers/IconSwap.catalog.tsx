"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Icon } from "../icons/Icon";
import { Button } from "../primitives/Button";
import { IconSwap } from "./IconSwap";

function IconSwapHarness() {
	const [activeIndex, setActiveIndex] = useState(0);
	return (
		<Button
			aria-label={activeIndex === 0 ? "Show password" : "Hide password"}
			onClick={() => setActiveIndex((current) => (current === 0 ? 1 : 0))}
			variant="secondary"
		>
			<span data-testid="swap">
				<IconSwap
					activeIndex={activeIndex}
					items={[
						{ icon: <Icon name="eye" /> },
						{ icon: <Icon name="eye-closed" /> },
					]}
				/>
			</span>
			Password
		</Button>
	);
}
function CatalogPreview1() {
	const render = () => <IconSwapHarness />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => (
		<div className="flex items-center gap-4">
			{(["sm", "md", "lg"] as const).map((size) => (
				<div className="grid gap-1" key={size}>
					<span className="text-xs">{size}</span>
					<IconSwap
						activeIndex={0}
						items={[{ icon: <Icon name="check" /> }]}
						size={size}
					/>
				</div>
			))}
		</div>
	);
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-helpers-icon-swap",
	name: "IconSwap",
	role: "Decorative transition owner for controls whose state is represented by one of several icons.",
	importStatement:
		'import { IconSwap } from "@/components/ui/helpers/IconSwap";',
	chooseWhen: [
		"A real control switches between stateful icons and needs the shared transition.",
	],
	chooseInstead: [
		"Use Icon for a single static glyph, or CopyStatusIcon for copy feedback.",
	],
	compounds: [],
	exclusions: [
		"Accessible-name ownership; the surrounding control must provide it.",
		"One-off opacity, scale, or rotation stacks.",
	],
	guarantees: [
		{
			label: "Stateful icon transition",
			storyId: "ui-helpers-icon-swap--stateful-transition",
		},
		{ label: "Shared size scale", storyId: "ui-helpers-icon-swap--size-scale" },
	],

	family: "UI",
	group: "Helpers",
	previewTargets: [
		{
			id: "stateful-transition",
			name: "Stateful icon transition",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "size-scale",
			name: "Shared size scale",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
