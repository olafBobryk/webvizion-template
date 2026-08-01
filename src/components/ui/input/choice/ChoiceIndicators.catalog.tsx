"use client";

import { useState } from "react";
import { defineCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { ChoiceField } from "./ChoiceField";
import {
	ChoiceIndicatorMulti,
	ChoiceIndicatorRadio,
	ChoiceIndicatorToggle,
} from "./ChoiceIndicators";

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
function CatalogPreview1() {
	const render = () => <IndicatorExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}
function CatalogPreview2() {
	const render = () => <IndicatorExample />;
	return (
		render as unknown as (
			args: Record<string, unknown>,
		) => ReturnType<typeof render>
	)({ ...{}, ...{} } as never);
}

export const catalogContract = defineCatalogOwnerContract({
	id: "ui-input-choice-indicators",
	name: "Choice Indicators",
	role: "Shared visible radio, checkbox, and toggle indicators for native ChoiceField composition.",
	importStatement:
		'import { ChoiceIndicatorMulti, ChoiceIndicatorRadio, ChoiceIndicatorToggle } from "@/components/ui/input";',
	chooseWhen: [
		"A reusable custom choice owner composes ChoiceField and needs the system indicator geometry.",
	],
	chooseInstead: ["Use complete choice inputs for ordinary form groups."],
	compounds: [
		"ChoiceIndicatorRadio",
		"ChoiceIndicatorMulti",
		"ChoiceIndicatorToggle",
	],
	exclusions: [
		"Standalone indicator use without a real native input and ChoiceField state.",
	],
	guarantees: [
		{
			label: "Indicator families mirror native checked state",
			storyId: "ui-input-choice-indicators--native-state-contract",
		},
		{
			label: "Production choice-field composition",
			storyId: "ui-input-choice-indicators--production-composition",
		},
	],

	family: "UI",
	group: "Input / Choice",
	sweepSpan: "full",
	previewTargets: [
		{
			id: "native-state-contract",
			name: "Indicator families mirror native checked state",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview1,
		},
		{
			id: "production-composition",
			name: "Production choice-field composition",
			baseline: {},
			axes: [],
			stage: "standard",
			Render: CatalogPreview2,
		},
	],
});
