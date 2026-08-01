import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { Icon, type IconName } from "./Icon";
import { catalogContract } from "./Icon.catalog";
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

const meta = {
	id: "ui-icons-icon",
	excludeStories: ["catalogContract"],
	title: "UI/Icons/Icon and Registry",
	component: Icon,
	subcomponents: { "Icon.Skeleton": Icon.Skeleton },
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj;

export const SizesFramesAndSemantics: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Icon data-testid="small-icon" name="check" size="sm" />
			<Icon data-testid="medium-icon" frame="default" name="plus" size="md" />
			<Icon data-testid="large-icon" name="arrow-right" size="lg" mirrorInRtl />
			<Icon.Skeleton size="md" />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByTestId("small-icon").querySelector("svg"),
		).toHaveAttribute("aria-hidden", "true");
		await expect(canvas.getByTestId("medium-icon")).toHaveClass(
			"rounded-button-sm",
		);
	},
};

export const RegistryExtension: Story = {
	render: () => {
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
	},
	play: async ({ canvas }) => {
		await expect(
			canvas.getByTestId("registry-icon").querySelector("circle"),
		).toBeInTheDocument();
	},
};

export const RegistryGallery: Story = {
	render: () => <RegistryGalleryContent />,
	play: async ({ canvas }) => {
		const arrowRight = canvas.getByText("arrow-right");
		await expect(arrowRight).toBeVisible();
		await expect(
			arrowRight.closest("div")?.querySelector("svg"),
		).toBeInTheDocument();
	},
};
