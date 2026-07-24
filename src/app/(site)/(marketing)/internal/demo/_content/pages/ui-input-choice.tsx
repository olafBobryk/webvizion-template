"use client";

import { useState } from "react";
import {
	ButtonMultiSelectInput,
	ChoiceField,
	ChoiceIndicatorMulti,
	ChoiceIndicatorRadio,
	ChoiceIndicatorToggle,
	MultiselectInput,
	RadioInput,
	ToggleInput,
} from "@/components/ui/input";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiInputChoiceDemoPage: DemoPage = {
	id: "ui-input-choice",
	slug: ["ui", "input", "choice"],
	title: "UI Input: Choice",
	description: "Radio, checkbox, and toggle inputs included in thin-start",
	groups: [
		{
			id: "choice-inputs",
			title: "Choice Inputs",
			description: "Native choice groups built from Field and indicators",
			items: [
				{
					id: "radio-input",
					kind: "component",
					name: "RadioInput",
					label: "Radio group",
					related: relatedMap.RadioInput,
					Render() {
						const [radio, setRadio] = useState("opt1");

						return (
							<RadioInput
								label="Radio"
								options={[
									{ value: "opt1", label: "Option 1" },
									{ value: "opt2", label: "Option 2" },
									{ value: "opt3", label: "Option 3", disabled: true },
								]}
								value={radio}
								onChange={setRadio}
							/>
						);
					},
				},
				{
					id: "multiselect-input",
					kind: "component",
					name: "MultiselectInput",
					label: "Multi checkbox",
					related: relatedMap.MultiselectInput,
					Render() {
						const [multiselect, setMultiselect] = useState(["opt1"]);

						return (
							<MultiselectInput
								label="Multiselect"
								options={[
									{ value: "opt1", label: "Option 1" },
									{ value: "opt2", label: "Option 2" },
									{ value: "opt3", label: "Option 3", disabled: true },
								]}
								value={multiselect}
								onChange={setMultiselect}
							/>
						);
					},
				},
				{
					id: "button-multiselect-input",
					kind: "component",
					name: "ButtonMultiSelectInput",
					label: "Button multi-select",
					related: relatedMap.ButtonMultiSelectInput,
					Render() {
						const [buttonChoices, setButtonChoices] = useState([
							"design",
							"copy",
						]);

						return (
							<ButtonMultiSelectInput
								label="Review focus"
								description="Compact button choices for filters, tags, and preference pickers."
								options={[
									{ value: "design", label: "Design" },
									{ value: "copy", label: "Copy" },
									{ value: "motion", label: "Motion" },
									{ value: "blocked", label: "Blocked", disabled: true },
								]}
								value={buttonChoices}
								onChange={setButtonChoices}
							/>
						);
					},
				},
				{
					id: "toggle-input",
					kind: "component",
					name: "ToggleInput",
					label: "Toggle list",
					related: relatedMap.ToggleInput,
					Render() {
						const [toggles, setToggles] = useState(["opt2"]);

						return (
							<ToggleInput
								label="Toggles"
								options={[
									{ value: "opt1", label: "Option 1" },
									{ value: "opt2", label: "Option 2" },
									{ value: "opt3", label: "Option 3", disabled: true },
								]}
								value={toggles}
								onChange={setToggles}
							/>
						);
					},
				},
				{
					id: "choice-field",
					kind: "component",
					name: "ChoiceField",
					label: "Accessible choice",
					related: relatedMap.ChoiceField,
					Render() {
						const [choiceDemo, setChoiceDemo] = useState("choice-a");

						return (
							<div className="flex flex-col gap-2">
								<ChoiceField
									id="choice-a"
									label="Choice A"
									value="choice-a"
									checked={choiceDemo === "choice-a"}
									indicator={
										<ChoiceIndicatorRadio checked={choiceDemo === "choice-a"} />
									}
									onChange={(value) => setChoiceDemo(value)}
								/>
								<ChoiceField
									id="choice-b"
									label="Choice B"
									value="choice-b"
									checked={choiceDemo === "choice-b"}
									indicator={
										<ChoiceIndicatorRadio checked={choiceDemo === "choice-b"} />
									}
									onChange={(value) => setChoiceDemo(value)}
								/>
								<ChoiceField
									id="choice-c"
									label="Choice C (disabled)"
									value="choice-c"
									checked={false}
									disabled
									indicator={<ChoiceIndicatorRadio checked={false} />}
									onChange={(value) => setChoiceDemo(value)}
								/>
							</div>
						);
					},
				},
				{
					id: "choice-indicator-radio",
					kind: "component",
					name: "ChoiceIndicatorRadio",
					label: "Radio indicator",
					related: relatedMap.ChoiceIndicatorRadio,
					Render() {
						return <ChoiceIndicatorRadio checked />;
					},
				},
				{
					id: "choice-indicator-multi",
					kind: "component",
					name: "ChoiceIndicatorMulti",
					label: "Checkbox indicator",
					related: relatedMap.ChoiceIndicatorMulti,
					Render() {
						return <ChoiceIndicatorMulti checked />;
					},
				},
				{
					id: "choice-indicator-toggle",
					kind: "component",
					name: "ChoiceIndicatorToggle",
					label: "Toggle indicator",
					related: relatedMap.ChoiceIndicatorToggle,
					Render() {
						return <ChoiceIndicatorToggle checked />;
					},
				},
			],
		},
	],
};
