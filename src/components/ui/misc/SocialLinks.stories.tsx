import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
	createIconRegistry,
	IconProvider,
} from "@/components/ui/icons/iconRegistry";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { SocialLinks } from "./SocialLinks";
import { catalogContract } from "./SocialLinks.catalog";

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
const meta = {
	id: "ui-misc-social-links",
	title: "UI/Misc/SocialLinks",
	component: SocialLinks,
	excludeStories: ["catalogContract", "links"],
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
	args: { links: [...links] },
} satisfies Meta<typeof SocialLinks>;
export default meta;
type Story = StoryObj<typeof meta>;
export const LinkContract: Story = {
	play: async ({ canvas }) => {
		for (const label of ["GitHub", "Instagram", "TikTok", "LinkedIn"]) {
			const link = canvas.getByRole("link", { name: label });
			await expect(link).toHaveAttribute("target", "_blank");
			await expect(link).toHaveAttribute("rel", "noreferrer");
			await expect(link.querySelector("svg")).toBeInTheDocument();
		}
	},
};
export const LabelAndSkeleton: Story = {
	render: () => (
		<div className="grid gap-4">
			<SocialLinks links={[...links]} showLabels />
			<SocialLinks.Skeleton showLabels count={3} />
		</div>
	),
	play: async ({ canvas }) => {
		await expect(
			canvas.getByRole("link", { name: /linkedin/i }),
		).toHaveTextContent("LinkedIn");
		await expect(canvas.getAllByText("Social link")).toHaveLength(3);
	},
};

export const FilledIconWeight: Story = {
	render: () => (
		<IconProvider registry={iconWeightRegistry}>
			<div className="flex gap-4">
				<SocialLinks links={[links[0]]} />
				<SocialLinks iconWeight="regular" links={[links[0]]} />
			</div>
		</IconProvider>
	),
	play: async ({ canvas }) => {
		const [filledLink, regularLink] = canvas.getAllByRole("link", {
			name: "GitHub",
		});
		await expect(filledLink.querySelector("svg")).toHaveAttribute(
			"data-icon-weight",
			"fill",
		);
		await expect(regularLink.querySelector("svg")).toHaveAttribute(
			"data-icon-weight",
			"regular",
		);
	},
};
