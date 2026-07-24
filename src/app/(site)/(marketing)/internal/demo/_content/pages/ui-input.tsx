"use client";

import { useState } from "react";
import {
	ColorInput,
	ColorSwatchInput,
	ComboboxMultiSelectInput,
	ComboboxTextInput,
	DateInput,
	DateRangeInput,
	type DateRangeValue,
	EditableTextField,
	EmailInput,
	NumberInput,
	PasswordInput,
	PhoneInput,
	ProfilePictureInput,
	SEMANTIC_COLOR_SWATCH_PRESETS,
	SelectInput,
	SignatureInput,
	SliderInput,
	TextAreaInput,
	TextInput,
	UnitNumberInput,
} from "@/components/ui/input";
import { ProfilePicture } from "@/components/ui/misc";
import { Text } from "@/components/ui/primitives/Text";
import { LISTBOX_OPTIONS } from "../inputOptions";
import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiInputDemoPage: DemoPage = {
	id: "ui-input",
	slug: ["ui", "input"],
	title: "UI Input",
	description: "Text + composite inputs",
	groups: [
		{
			id: "ui-input-core",
			title: "Inputs",
			description: "Text + composite inputs",
			items: [
				{
					id: "text-input",
					kind: "component",
					name: "TextInput",
					label: "Text input",
					related: relatedMap.TextInput,
					Render() {
						const [name, setName] = useState("");
						const [shortName, setShortName] = useState("Ada");

						return (
							<div className="flex flex-col gap-2">
								<TextInput
									label="Name"
									description="Required field"
									required
									placeholder="Jane Doe"
									value={name}
									onChange={setName}
								/>
								<TextInput
									label="Compact"
									size="sm"
									value={shortName}
									onChange={setShortName}
								/>
								<TextInput label="Disabled" defaultValue="Read only" disabled />
							</div>
						);
					},
				},
				{
					id: "editable-text-field",
					kind: "component",
					name: "EditableTextField",
					label: "Display-to-edit field",
					related: relatedMap.EditableTextField,
					Render() {
						const [fieldTitle, setFieldTitle] = useState("Template dashboard");
						const [inlineTitle, setInlineTitle] = useState("Rename inline");

						return (
							<div className="grid w-full max-w-sm gap-4">
								<EditableTextField
									description="Uses one stable field shell while viewing and editing."
									label="Dashboard title"
									onSave={async (nextTitle) => setFieldTitle(nextTitle)}
									validate={(nextTitle) =>
										nextTitle ? null : "Enter a title."
									}
									value={fieldTitle}
								/>
								<EditableTextField
									ariaLabel={`Rename ${inlineTitle}`}
									onSave={async (nextTitle) => setInlineTitle(nextTitle)}
									presentation="inline"
									value={inlineTitle}
								/>
								<EditableTextField.Skeleton
									description="Uses one stable field shell while viewing and editing."
									label="Loading title"
									value="Template dashboard"
								/>
							</div>
						);
					},
				},
				{
					id: "profile-picture-input",
					kind: "component",
					name: "ProfilePictureInput",
					label: "Profile image picker",
					related: relatedMap.ProfilePictureInput,
					Render() {
						const [selectedFileName, setSelectedFileName] = useState<
							string | null
						>(null);

						return (
							<div className="flex max-w-md flex-col gap-5">
								<ProfilePictureInput
									label="Profile picture"
									description="JPG, PNG, or WebP up to 25 MB."
									name="Ada Lovelace"
									onChange={(file) => setSelectedFileName(file?.name ?? null)}
								/>
								<ProfilePictureInput
									description="Source-style modal row."
									label="Profile picture · file row"
									layout="file-row"
									name="Ada Lovelace"
									onChange={(file) => setSelectedFileName(file?.name ?? null)}
								/>
								<ProfilePictureInput
									description="Keeps a domain-owned fallback and color seed."
									label="Profile picture · presentation preview"
									layout="file-row"
									name="Ada Lovelace"
									onChange={(file) => setSelectedFileName(file?.name ?? null)}
									renderPreview={({ className, name, size, src }) => (
										<ProfilePicture
											alt="Ada Lovelace presentation"
											className={className}
											fallback="AL"
											helperIndex={4}
											name={name}
											size={size}
											src={src}
										/>
									)}
								/>
								<Text as="p" variant="caption" tone="muted">
									{selectedFileName
										? `Selected: ${selectedFileName}`
										: "No file selected"}
								</Text>
							</div>
						);
					},
				},
				{
					id: "date-input",
					kind: "component",
					name: "DateInput",
					label: "Calendar date input",
					Render() {
						const [date, setDate] = useState<string | null>("2026-07-19");
						return (
							<div className="grid gap-4">
								<DateInput
									label="Review date"
									value={date}
									onChange={setDate}
								/>
								<DateInput label="Empty date" />
								<DateInput
									dropdownPositionStrategy="fixed"
									label="Constrained date"
									max="2026-07-28"
									min="2026-07-10"
									value="2026-07-22"
								/>
								<DateInput disabled label="Disabled date" value="2026-07-19" />
								<DateInput error="Choose a valid date." label="Invalid date" />
								<DateInput.Skeleton label="Loading date" value="Jul 19, 2026" />
							</div>
						);
					},
				},
				{
					id: "color-inputs",
					kind: "component",
					name: "ColorInput",
					label: "Color and semantic swatches",
					Render() {
						const [color, setColor] = useState("#3567EA");
						const [tone, setTone] = useState<
							"neutral" | "info" | "success" | "warning" | "danger"
						>("info");
						return (
							<div className="grid gap-4">
								<ColorInput
									label="Brand color"
									value={color}
									onChange={setColor}
								/>
								<ColorSwatchInput
									label="Status color"
									presets={SEMANTIC_COLOR_SWATCH_PRESETS}
									value={tone}
									onChange={(selection) => setTone(selection.value)}
								/>
							</div>
						);
					},
				},
				{
					id: "email-input",
					kind: "component",
					name: "EmailInput",
					label: "Email validation",
					related: relatedMap.EmailInput,
					Render() {
						const [email, setEmail] = useState("");

						return (
							<div className="flex flex-col gap-2">
								<EmailInput
									label="Email"
									placeholder="you@example.com"
									value={email}
									onChange={setEmail}
									validate={(val) =>
										val && !val.includes("@") ? "Invalid email" : null
									}
								/>
								<EmailInput
									label="Disabled"
									defaultValue="disabled@example.com"
									disabled
									size="sm"
								/>
							</div>
						);
					},
				},
				{
					id: "password-input",
					kind: "component",
					name: "PasswordInput",
					label: "Strength + toggle",
					related: relatedMap.PasswordInput,
					Render() {
						const [password, setPassword] = useState("");

						return (
							<div className="flex flex-col gap-2">
								<PasswordInput
									label="Password"
									placeholder="******"
									value={password}
									onChange={setPassword}
									showStrength
								/>
								<PasswordInput
									label="Disabled"
									placeholder="******"
									defaultValue="disabled"
									disabled
								/>
							</div>
						);
					},
				},
				{
					id: "text-area-input",
					kind: "component",
					name: "TextAreaInput",
					label: "Textarea",
					related: relatedMap.TextAreaInput,
					Render() {
						const [bio, setBio] = useState("");

						return (
							<div className="flex flex-col gap-2">
								<TextAreaInput
									label="Bio"
									placeholder="Short bio"
									value={bio}
									onChange={setBio}
									rows={3}
								/>
								<TextAreaInput
									label="With error"
									defaultValue="Too short"
									error="Add at least 10 characters"
									rows={2}
									size="sm"
								/>
							</div>
						);
					},
				},
				{
					id: "number-input",
					kind: "component",
					name: "NumberInput",
					label: "Numeric input",
					related: relatedMap.NumberInput,
					Render() {
						const [quantity, setQuantity] = useState(2);

						return (
							<div className="flex flex-col gap-2">
								<NumberInput
									label="Quantity"
									value={quantity}
									onChange={(next) => setQuantity(next ?? 0)}
									min={0}
									max={20}
									step={1}
									unit="pcs"
								/>
								<NumberInput
									label="Disabled"
									defaultValue={10}
									unit="pcs"
									disabled
									size="sm"
								/>
							</div>
						);
					},
				},
				{
					id: "unit-number-input",
					kind: "component",
					name: "UnitNumberInput",
					label: "Unit helper",
					related: relatedMap.UnitNumberInput,
					Render() {
						const [unitQuantity, setUnitQuantity] = useState(15);

						return (
							<div className="flex flex-col gap-2">
								<UnitNumberInput
									label="Budget"
									value={unitQuantity}
									unit="USD"
									onChange={(next) => setUnitQuantity(next ?? 0)}
								/>
								<UnitNumberInput
									label="Disabled"
									defaultValue={250}
									unit="USD"
									disabled
									size="sm"
								/>
							</div>
						);
					},
				},
				{
					id: "slider-input",
					kind: "component",
					name: "SliderInput",
					label: "Range + number",
					related: relatedMap.SliderInput,
					Render() {
						const [slider, setSlider] = useState(42);

						return (
							<div className="flex flex-col gap-2">
								<SliderInput
									label="Progress"
									value={slider}
									onChange={(next) => setSlider(next ?? 0)}
									min={0}
									max={100}
									step={1}
									unit="%"
								/>
								<SliderInput
									label="Disabled"
									value={30}
									onChange={() => {}}
									min={0}
									max={100}
									step={5}
									unit="%"
									disabled
									size="sm"
								/>
							</div>
						);
					},
				},
				{
					id: "phone-input",
					kind: "component",
					name: "PhoneInput",
					label: "Dial code input",
					related: relatedMap.PhoneInput,
					Render() {
						const [phone, setPhone] = useState<string | undefined>(undefined);

						return (
							<div className="flex flex-col gap-2">
								<PhoneInput label="Phone" value={phone} onChange={setPhone} />
								<PhoneInput
									label="Disabled"
									value="+1 555 0100"
									onChange={() => {}}
									disabled
									size="sm"
								/>
							</div>
						);
					},
				},
				{
					id: "select-input",
					kind: "component",
					name: "SelectInput",
					label: "Select + search",
					related: relatedMap.SelectInput,
					Render() {
						const [select, setSelect] = useState("alpha");

						return (
							<div className="flex flex-col gap-2">
								<SelectInput
									dropdownPositionStrategy="fixed"
									label="Select"
									placeholder="Select option"
									value={select}
									onChange={setSelect}
									options={LISTBOX_OPTIONS.map((opt) => ({
										value: opt.value,
										label: opt.content,
										symbol: opt.content[0],
									}))}
								/>
								<SelectInput
									label="Disabled"
									value="beta"
									onChange={() => {}}
									disabled
									size="sm"
									options={LISTBOX_OPTIONS.map((opt) => ({
										value: opt.value,
										label: opt.content,
										symbol: opt.content[0],
									}))}
								/>
							</div>
						);
					},
				},
				{
					id: "combobox-text-input",
					kind: "component",
					name: "ComboboxTextInput",
					label: "Combobox",
					related: relatedMap.ComboboxTextInput,
					Render() {
						const [combobox, setCombobox] = useState("Alpha");

						return (
							<div className="flex flex-col gap-2">
								<ComboboxTextInput
									label="Combobox"
									placeholder="Pick option"
									value={combobox}
									onChange={setCombobox}
									options={LISTBOX_OPTIONS.map((opt) => ({
										id: opt.value,
										label: opt.content,
									}))}
								/>
								<ComboboxTextInput
									label="Disabled"
									defaultValue="Gamma"
									disabled
									size="sm"
									options={LISTBOX_OPTIONS.map((opt) => ({
										id: opt.value,
										label: opt.content,
									}))}
								/>
							</div>
						);
					},
				},
				{
					id: "combobox-multi-select-input",
					kind: "component",
					name: "ComboboxMultiSelectInput",
					label: "Combo multiselect",
					related: relatedMap.ComboboxMultiSelectInput,
					Render() {
						const [comboboxMulti, setComboboxMulti] = useState(["alpha"]);

						return (
							<div className="flex flex-col gap-2">
								<ComboboxMultiSelectInput
									label="Combobox multi"
									placeholder="Search options"
									value={comboboxMulti}
									onChange={setComboboxMulti}
									endText={`${comboboxMulti.length} selected`}
									options={LISTBOX_OPTIONS.map((opt) => ({
										value: opt.value,
										label: opt.content,
										symbol: opt.content[0],
									}))}
								/>
								<ComboboxMultiSelectInput
									label="Disabled"
									placeholder="Search options"
									value={["beta"]}
									onChange={() => {}}
									endText="1 selected"
									disabled
									size="sm"
									options={LISTBOX_OPTIONS.map((opt) => ({
										value: opt.value,
										label: opt.content,
										symbol: opt.content[0],
									}))}
								/>
							</div>
						);
					},
				},
				{
					id: "date-range-dropdown",
					kind: "component",
					name: "DateRangeInput",
					label: "Date range",
					related: relatedMap.DateRangeInput,
					Render() {
						const [range, setRange] = useState<DateRangeValue | null>({
							end: "2026-07-15",
							start: "2026-07-10",
						});

						return (
							<div className="grid gap-4">
								<DateRangeInput
									label="Reporting window"
									onChange={setRange}
									value={range}
								/>
								<DateRangeInput label="Empty range" />
								<DateRangeInput
									dropdownPositionStrategy="fixed"
									label="Constrained range"
									max="2026-08-31"
									min="2026-06-01"
								/>
								<DateRangeInput
									disabled
									label="Disabled range"
									value={{ end: "2026-07-22", start: "2026-07-01" }}
								/>
								<DateRangeInput.Skeleton
									label="Loading range"
									value="Jul 10, 2026 - Jul 15, 2026"
								/>
							</div>
						);
					},
				},
				{
					id: "signature-input",
					kind: "component",
					name: "SignatureInput",
					label: "Canvas signature input",
					related: relatedMap.SignatureInput,
					Render() {
						return (
							<div className="grid w-full gap-4">
								<SignatureInput
									description="Draw inside the field."
									height={120}
									label="Signature"
								/>
								<SignatureInput disabled height={96} label="Disabled" />
								<SignatureInput.Skeleton
									height={120}
									label="Loading signature"
								/>
							</div>
						);
					},
				},
			],
		},
		{
			id: "ui-input-copy",
			title: "Copy Inputs",
			description: "Inputs with copy affordances",
			items: [
				{
					id: "text-input-copy",
					kind: "component",
					name: "TextInput",
					label: "Copy enabled",
					related: relatedMap.TextInput,
					Render() {
						const [token, setToken] = useState("invite-8392-AZ");

						return (
							<div className="flex flex-col gap-2">
								<TextInput
									label="Invite code"
									description="Copy and share this code"
									value={token}
									onChange={setToken}
									copy
								/>
								<TextInput
									label="Readonly copy"
									defaultValue="TEAM-ACCESS-2024"
									copy
									copyToastMessage="Access code copied"
								/>
							</div>
						);
					},
				},
			],
		},
	],
};
