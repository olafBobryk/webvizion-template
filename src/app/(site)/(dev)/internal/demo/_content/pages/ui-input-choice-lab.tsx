"use client";

import { useState } from "react";
import {
	ChoiceField,
	ChoiceIndicatorMulti,
	ChoiceIndicatorRadio,
	ChoiceIndicatorToggle,
} from "@/components/ui/input";
import Divider from "@/components/ui/primitives/Divider";
import { Text } from "@/components/ui/primitives/Text";

import type { DemoPage } from "../types";

function updateChoiceIndicatorLabValues(
	current: string[],
	value: string,
	checked: boolean,
) {
	return checked
		? Array.from(new Set([...current, value]))
		: current.filter((item) => item !== value);
}

function LockedChoiceIndicatorLab() {
	const [radio, setRadio] = useState("team");
	const [multi, setMulti] = useState(["mentions"]);
	const [toggles, setToggles] = useState(["motion"]);

	return (
		<div className="grid gap-5">
			<Text tone="muted" variant="caption">
				The production indicators: solid radio and checkbox, plus the muted
				contrast toggle. All rows remain standard ChoiceField instances.
			</Text>

			<div className="grid gap-3">
				<Text variant="bodyStrong">Radio</Text>
				{[
					["team", "Team workspace"],
					["private", "Private drafts"],
				].map(([value, label]) => (
					<ChoiceField
						checked={radio === value}
						description={
							value === "team"
								? "Shared with your team."
								: "Visible only to you."
						}
						id={`indicator-lab-solid-radio-${value}`}
						indicator={<ChoiceIndicatorRadio checked={radio === value} />}
						key={value}
						label={label}
						name="indicator-lab-solid-radio"
						onChange={setRadio}
						value={value}
					/>
				))}
			</div>

			<Divider />

			<div className="grid gap-3">
				<Text variant="bodyStrong">Checkbox</Text>
				{[
					["mentions", "Mentions", false],
					["digest", "Weekly digest", false],
					["sms", "SMS alerts", true],
				].map(([value, label, disabled]) => {
					const checked = multi.includes(String(value));
					return (
						<ChoiceField
							checked={checked}
							disabled={Boolean(disabled)}
							id={`indicator-lab-solid-multi-${value}`}
							indicator={
								<ChoiceIndicatorMulti
									checked={checked}
									disabled={Boolean(disabled)}
								/>
							}
							inputType="checkbox"
							key={String(value)}
							label={String(label)}
							name="indicator-lab-solid-multi"
							onChange={(next, nextChecked) =>
								setMulti((current) =>
									updateChoiceIndicatorLabValues(current, next, nextChecked),
								)
							}
							value={String(value)}
						/>
					);
				})}
			</div>

			<Divider />

			<div className="grid gap-3">
				<Text variant="bodyStrong">Toggle</Text>
				{[
					["motion", "Reduced motion"],
					["scroll", "Smooth scrolling"],
				].map(([value, label]) => {
					const checked = toggles.includes(value);
					return (
						<ChoiceField
							checked={checked}
							id={`indicator-lab-toggle-muted-${value}`}
							indicator={<ChoiceIndicatorToggle checked={checked} />}
							inputType="checkbox"
							key={value}
							label={label}
							name="indicator-lab-toggle-muted"
							onChange={(next, nextChecked) =>
								setToggles((current) =>
									updateChoiceIndicatorLabValues(current, next, nextChecked),
								)
							}
							value={value}
						/>
					);
				})}
			</div>
		</div>
	);
}

export const uiInputChoiceLabDemoPage: DemoPage = {
	id: "ui-input-choice-lab",
	slug: ["ui", "input", "choice", "lab"],
	title: "Choice Indicator Review",
	description:
		"Locked production treatment for solid radio and checkbox indicators with the muted contrast toggle.",
	visibility: "dev-only",
	groups: [
		{
			id: "choice-indicator-locked",
			title: "Locked choice indicators",
			description:
				"These examples now render the shared production indicators rather than page-local experiments.",
			columns: "grid-cols-1 xl:grid-cols-2",
			items: [
				{
					id: "choice-locked-indicators",
					kind: "component",
					name: "Production indicators",
					label: "Solid + muted contrast",
					related: {
						uses: [
							"ChoiceField",
							"ChoiceIndicatorRadio",
							"ChoiceIndicatorMulti",
							"ChoiceIndicatorToggle",
						],
						usedIn: [],
					},
					Render() {
						return <LockedChoiceIndicatorLab />;
					},
				},
			],
		},
	],
};
