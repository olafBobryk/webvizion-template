import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { getOrganizationPresentation } from "../../../_lib/entities/organization/presentation";
import type { OrganizationIdentityVisual } from "./OrganizationAvatar";
import { OrganizationSelector } from "./OrganizationSelector";
import { catalogContract } from "./OrganizationSelector.catalog";

const organizations = [
	["Averlo Studio", "averlo-studio", "owner"],
	["Northstar Lab", "northstar-lab", "admin"],
	["Field Notes", "field-notes", "member"],
].map(([name, slug, role], index) =>
	getOrganizationPresentation({
		id: `organization-story-${index}`,
		name,
		profilePictureUrl: "/test/placeholder-square.jpg",
		role: role as "admin" | "member" | "owner",
		slug,
	}),
);

function ControlledOrganizationSelector({
	visual,
}: {
	visual?: OrganizationIdentityVisual;
}) {
	const [value, setValue] = useState<string | null>(organizations[0].id);
	return (
		<div className="w-80">
			<OrganizationSelector
				onChange={setValue}
				organizations={organizations}
				value={value}
				visual={visual}
			/>
		</div>
	);
}

const meta = {
	id: "dashboard-entity-organization-selector",
	title: "Dashboard/Entities/Organization/OrganizationSelector",
	component: OrganizationSelector,
	subcomponents: {
		"OrganizationSelector.Skeleton": OrganizationSelector.Skeleton,
	},
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "todo" },
	},
} satisfies Meta<typeof OrganizationSelector>;
export default meta;
type Story = StoryObj;

export const Selection: Story = {
	render: () => <ControlledOrganizationSelector />,
	play: async ({ canvas, canvasElement }) => {
		const input = canvas.getByRole("combobox", { name: "Organization" });
		await expect(input).toHaveValue("Averlo Studio");
		await userEvent.click(input);
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(
			await body.findByRole("option", { name: /Northstar Lab/ }),
		);
		await expect(input).toHaveValue("Northstar Lab");
	},
};

export const IconOptions: Story = {
	render: () => <ControlledOrganizationSelector visual="icon" />,
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(
			canvas.getByRole("combobox", { name: "Organization" }),
		);
		const body = within(canvasElement.ownerDocument.body);
		const option = await body.findByRole("option", { name: /Averlo Studio/ });
		await expect(option.querySelector("svg")).toBeInTheDocument();
	},
};

export const Loading: Story = {
	render: () => (
		<div className="w-80">
			<OrganizationSelector.Skeleton />
		</div>
	),
};
