import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ChoiceField } from "./ChoiceField";
import {
	ChoiceIndicatorMulti,
	ChoiceIndicatorRadio,
	ChoiceIndicatorToggle,
} from "./ChoiceIndicators";
import { catalogContract } from "./ChoiceIndicators.catalog";

function IndicatorExample() {
	const [radio, setRadio] = useState("team");
	const [multi, setMulti] = useState(["mentions"]);
	const [toggles, setToggles] = useState(["motion"]);
	const toggleMulti = (value: string, checked: boolean) =>
		setMulti((current) =>
			checked
				? Array.from(new Set([...current, value]))
				: current.filter((item) => item !== value),
		);
	const toggleSetting = (value: string, checked: boolean) =>
		setToggles((current) =>
			checked
				? Array.from(new Set([...current, value]))
				: current.filter((item) => item !== value),
		);
	return (
		<div className="grid gap-4">
			<ChoiceField
				checked={radio === "team"}
				id="indicator-radio-team"
				indicator={<ChoiceIndicatorRadio checked={radio === "team"} />}
				label="Team workspace"
				name="indicator-radio"
				onChange={setRadio}
				value="team"
			/>
			<ChoiceField
				checked={radio === "private"}
				id="indicator-radio-private"
				indicator={<ChoiceIndicatorRadio checked={radio === "private"} />}
				label="Private drafts"
				name="indicator-radio"
				onChange={setRadio}
				value="private"
			/>
			<ChoiceField
				checked={multi.includes("mentions")}
				id="indicator-checkbox-mentions"
				indicator={
					<ChoiceIndicatorMulti checked={multi.includes("mentions")} />
				}
				inputType="checkbox"
				label="Mentions"
				name="indicator-checkbox"
				onChange={(value, checked) => toggleMulti(value, checked)}
				value="mentions"
			/>
			<ChoiceField
				checked={multi.includes("sms")}
				disabled
				id="indicator-checkbox-sms"
				indicator={
					<ChoiceIndicatorMulti checked={multi.includes("sms")} disabled />
				}
				inputType="checkbox"
				label="SMS alerts"
				name="indicator-checkbox"
				onChange={(value, checked) => toggleMulti(value, checked)}
				value="sms"
			/>
			<ChoiceField
				checked={toggles.includes("motion")}
				id="indicator-toggle-motion"
				indicator={
					<ChoiceIndicatorToggle checked={toggles.includes("motion")} />
				}
				inputType="checkbox"
				label="Reduced motion"
				name="indicator-toggle"
				onChange={(value, checked) => toggleSetting(value, checked)}
				value="motion"
			/>
			<ChoiceField
				checked={toggles.includes("scroll")}
				id="indicator-toggle-scroll"
				indicator={
					<ChoiceIndicatorToggle checked={toggles.includes("scroll")} />
				}
				inputType="checkbox"
				label="Smooth scrolling"
				name="indicator-toggle"
				onChange={(value, checked) => toggleSetting(value, checked)}
				value="scroll"
			/>
		</div>
	);
}

const meta = {
	id: "ui-input-choice-indicators",
	excludeStories: ["catalogContract"],
	title: "UI/Input/Choice/Choice Indicators",
	component: ChoiceIndicatorMulti,
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		layout: "centered",
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta<typeof ChoiceIndicatorMulti>;

export default meta;
type Story = StoryObj;

export const NativeStateContract: Story = {
	render: () => <IndicatorExample />,
	play: async ({ canvas }) => {
		const mentions = canvas.getByRole("checkbox", { name: "Mentions" });
		await userEvent.click(mentions);
		await expect(mentions).not.toBeChecked();
		await expect(
			canvas.getByRole("radio", { name: "Team workspace" }),
		).toBeChecked();
		await expect(
			canvas.getByRole("checkbox", { name: "Reduced motion" }),
		).toBeChecked();
	},
};

export const ProductionComposition: Story = {
	render: () => <IndicatorExample />,
	play: async ({ canvas }) => {
		const privateDrafts = canvas.getByRole("radio", { name: "Private drafts" });
		const smoothScrolling = canvas.getByRole("checkbox", {
			name: "Smooth scrolling",
		});
		await expect(
			canvas.getByRole("checkbox", { name: "SMS alerts" }),
		).toBeDisabled();
		await userEvent.click(privateDrafts);
		await expect(privateDrafts).toBeChecked();
		await userEvent.click(smoothScrolling);
		await expect(smoothScrolling).toBeChecked();
	},
};
