"use client";

import { type Ref, useState } from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Chip } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/primitives/Card";
import Divider from "@/components/ui/primitives/Divider";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import { Listbox } from "@/components/ui/primitives/Listbox";
import { Panel } from "@/components/ui/primitives/Panel";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { Text } from "@/components/ui/primitives/Text";
import { LISTBOX_OPTIONS } from "../inputOptions";
import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiPrimitivesDemoPage: DemoPage = {
	id: "ui-primitives",
	slug: ["ui", "primitives"],
	title: "UI Primitives",
	description: "Typography, buttons, layout",
	groups: [
		{
			id: "ui-primitives-core",
			title: "UI Primitives",
			description: "Typography, buttons, layout",
			items: [
				{
					id: "text",
					kind: "component",
					name: "Text",
					label: "Typography variants",
					related: relatedMap.Text,
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<Text as="h3" variant="headingLg">
									Heading LG
								</Text>
								<Text as="h4" variant="headingMd">
									Heading MD
								</Text>
								<Text as="h5" variant="headingSm">
									Heading SM
								</Text>
								<Text as="h6" variant="headingXs">
									Heading XS
								</Text>
								<Text variant="bodyStrong">Body strong</Text>
								<Text variant="body">Body text</Text>
								<Text variant="body" tone="muted">
									Muted text
								</Text>
								<Text variant="caption" tone="muted">
									Caption muted
								</Text>
								<div className="rounded-lg bg-foreground px-4 py-3">
									<Text
										variant="body"
										theme="light"
										tone="muted"
										interactive={false}
									>
										Muted light text
									</Text>
								</div>
							</div>
						);
					},
					skeleton: {
						name: "Text.Skeleton",
						Render() {
							return (
								<div className="flex flex-col gap-2">
									<Text.Skeleton as="h3" variant="headingLg">
										Heading LG
									</Text.Skeleton>
									<Text.Skeleton as="h4" variant="headingMd">
										Heading MD
									</Text.Skeleton>
									<Text.Skeleton as="h5" variant="headingSm">
										Heading SM
									</Text.Skeleton>
									<Text.Skeleton as="h6" variant="headingXs">
										Heading XS
									</Text.Skeleton>
									<Text.Skeleton variant="bodyStrong">
										Body strong
									</Text.Skeleton>
									<Text.Skeleton variant="body">Body text</Text.Skeleton>
									<Text.Skeleton variant="body" tone="muted">
										Muted text
									</Text.Skeleton>
									<Text.Skeleton variant="caption" tone="muted">
										Caption muted
									</Text.Skeleton>
								</div>
							);
						},
					},
				},
				{
					id: "chip",
					kind: "component",
					name: "Chip",
					label: "Borderless compact metadata label",
					related: relatedMap.Chip,
					Render() {
						return (
							<div className="flex flex-wrap gap-2">
								<Chip leadingIcon="home" tone="helper" helperIndex={5}>
									Individual
								</Chip>
								<Chip leadingIcon="gear" tone="helper" helperIndex={2}>
									Company
								</Chip>
								<Chip href="/internal/demo" trailingIcon="arrow-right">
									Linked chip
								</Chip>
								<Chip color="success">Ready</Chip>
								<Chip color="warning">Needs review</Chip>
								<Chip color="#9C46BF">Custom</Chip>
							</div>
						);
					},
					skeleton: {
						name: "Chip.Skeleton",
						Render() {
							return (
								<div className="flex flex-wrap gap-2">
									<Chip.Skeleton leadingIcon>Individual</Chip.Skeleton>
									<Chip.Skeleton>Linked chip</Chip.Skeleton>
								</div>
							);
						},
					},
				},
				{
					id: "button",
					kind: "component",
					name: "Button",
					label: "Variants + loading",
					related: relatedMap.Button,
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<div className="flex flex-wrap gap-2">
									<Button variant="primary">Primary</Button>
									<Button>Secondary default</Button>
									<Button variant="ghost">Ghost</Button>
									<Button variant="inverse">Inverse</Button>
									<Button tone="danger">Danger</Button>
									<Button variant="primary" tone="danger">
										Danger primary
									</Button>
									<Button variant="ghost" tone="danger">
										Danger ghost
									</Button>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Button size="sm">Small</Button>
									<Button size="md">Medium</Button>
									<Button size="lg">Large</Button>
									<Button size="xl">Extra large</Button>
									<Button
										variant="ghost"
										size="none"
										className="text-sm font-medium"
									>
										Ghost none
									</Button>
									<Button size="icon" leadingIcon="plus" aria-label="Add" />
									<Button
										dir="rtl"
										variant="secondary"
										trailingIcon={{
											name: "arrow-right",
											mirrorInRtl: true,
										}}
									>
										RTL action
									</Button>
									<Button variant="secondary" loading>
										Loading
									</Button>
									<Button variant="secondary" disabled>
										Disabled
									</Button>
								</div>
							</div>
						);
					},
					skeleton: {
						name: "Button.Skeleton",
						Render() {
							return (
								<div className="flex flex-col gap-2">
									<div className="flex flex-wrap items-center gap-2">
										<Button.Skeleton size="md" variant="primary">
											Primary
										</Button.Skeleton>
										<Button.Skeleton size="md">Secondary</Button.Skeleton>
										<Button.Skeleton size="md" variant="inverse">
											Inverse
										</Button.Skeleton>
										<Button.Skeleton size="md" tone="danger">
											Danger
										</Button.Skeleton>
										<Button.Skeleton size="md" variant="ghost">
											Ghost
										</Button.Skeleton>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<Button.Skeleton size="sm">Small</Button.Skeleton>
										<Button.Skeleton size="md">Medium</Button.Skeleton>
										<Button.Skeleton size="lg">Large</Button.Skeleton>
										<Button.Skeleton size="icon" leadingIcon />
										<Button.Skeleton size="md">Loading</Button.Skeleton>
										<Button.Skeleton size="md">Disabled</Button.Skeleton>
									</div>
								</div>
							);
						},
					},
				},
				{
					id: "card",
					kind: "component",
					name: "Card",
					label: "Slot container",
					related: relatedMap.Card,
					Render() {
						return (
							<Card>
								<CardHeader>
									<div className="flex items-center gap-2">
										<Icon
											name="cards"
											size="sm"
											className="text-muted-foreground"
										/>
										<CardTitle as="h4">Project</CardTitle>
									</div>
									<CardDescription>
										Structured card with an informative header.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button size="sm" variant="secondary">
										Open details
									</Button>
								</CardContent>
							</Card>
						);
					},
				},
				{
					id: "divider",
					kind: "component",
					name: "Divider",
					label: "Content separator",
					related: relatedMap.Divider,
					Render() {
						return (
							<div className="grid gap-4">
								<Divider />
								<Panel background="surface" padding="sm" radius="xs">
									<Divider>Surface-neutral label</Divider>
								</Panel>
							</div>
						);
					},
				},
				{
					id: "status-message",
					kind: "component",
					name: "StatusMessage",
					label: "Persistent contextual notice",
					related: relatedMap.StatusMessage,
					Render() {
						const [open, setOpen] = useState(false);
						return (
							<div className="grid gap-4">
								<StatusMessage tone="warning">
									Changing ownership also transfers billing responsibility.
								</StatusMessage>
								<div className="flex flex-col items-start">
									<Button
										onClick={() => setOpen((current) => !current)}
										size="sm"
										variant="secondary"
									>
										{open ? "Hide contextual notice" : "Show contextual notice"}
									</Button>
									<StatusMessage.Presence open={open} tone="info">
										This notice remains relevant until the setting changes.
									</StatusMessage.Presence>
								</div>
							</div>
						);
					},
				},
				{
					id: "field",
					kind: "component",
					name: "Field",
					label: "Label + message",
					related: relatedMap.Field,
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<Field
									label="Label"
									description="Helper text"
									message="Error message"
									tone="error"
									required
								>
									<InputFrame fullWidth>
										<input
											className={inputVariants({
												size: "md",
											})}
											placeholder="Error state"
										/>
									</InputFrame>
								</Field>
								<Field
									label="Success label"
									description="Helper text"
									message="Looks good"
									tone="success"
								>
									<InputFrame fullWidth>
										<input
											className={inputVariants({ size: "md" })}
											placeholder="Success state"
										/>
									</InputFrame>
								</Field>
							</div>
						);
					},
				},
				{
					id: "input-frame",
					kind: "component",
					name: "InputFrame",
					label: "Input shell",
					related: relatedMap.InputFrame,
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<InputFrame
									start={<Icon name="search" size="sm" />}
									end={
										<Text variant="caption" tone="muted">
											Cmd+K
										</Text>
									}
									fullWidth
								>
									<input
										className={inputVariants({
											size: "md",
											hasStart: true,
											hasEnd: true,
										})}
										placeholder="Search"
									/>
								</InputFrame>
								<InputFrame
									start={<Icon name="search" size="sm" />}
									fullWidth
									disabled
									size="sm"
								>
									<input
										className={inputVariants({
											size: "sm",
											disabled: true,
											hasStart: true,
										})}
										placeholder="Disabled"
										disabled
									/>
								</InputFrame>
							</div>
						);
					},
				},
				{
					id: "listbox",
					kind: "component",
					name: "Listbox",
					label: "List selection",
					related: relatedMap.Listbox,
					Render() {
						const [listboxActive, setListboxActive] = useState(0);
						const [listboxSelected, setListboxSelected] = useState("alpha");

						return (
							<Listbox
								options={LISTBOX_OPTIONS.map((opt) => ({
									value: opt.value,
									content: opt.content,
									selected: listboxSelected === opt.value,
								}))}
								activeIndex={listboxActive}
								onActiveIndexChange={setListboxActive}
								onSelect={(option) => setListboxSelected(String(option.value))}
								className="!border-border/10"
							/>
						);
					},
				},
				{
					id: "dropdown",
					kind: "component",
					name: "Dropdown",
					label: "Fixed + absolute positioning",
					related: relatedMap.Dropdown,
					Render() {
						return (
							<div className="grid gap-3 pb-44 md:grid-cols-2">
								<div className="flex flex-col gap-2">
									<Text variant="caption" tone="muted">
										Fixed follow
									</Text>
									<Dropdown
										positionStrategy="fixed"
										renderTrigger={({ ref, onRightClick, chevronIcon }) => (
											<Button
												ref={ref as Ref<HTMLElement>}
												variant="secondary"
												className="w-full"
												onClick={onRightClick}
											>
												<span className="flex w-full items-center justify-between gap-2">
													<span>Fixed menu</span>
													{chevronIcon}
												</span>
											</Button>
										)}
										renderMenu={({ close }) => (
											<Listbox
												options={LISTBOX_OPTIONS.map((opt) => ({
													value: opt.value,
													content: opt.content,
												}))}
												onSelect={() => close()}
											/>
										)}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Text variant="caption" tone="muted">
										Absolute static
									</Text>
									<Dropdown
										positionStrategy="absolute"
										renderTrigger={({ ref, onRightClick, chevronIcon }) => (
											<Button
												ref={ref as Ref<HTMLElement>}
												variant="secondary"
												className="w-full"
												onClick={onRightClick}
											>
												<span className="flex w-full items-center justify-between gap-2">
													<span>Absolute menu</span>
													{chevronIcon}
												</span>
											</Button>
										)}
										renderMenu={({ close }) => (
											<Listbox
												options={LISTBOX_OPTIONS.map((opt) => ({
													value: opt.value,
													content: opt.content,
												}))}
												onSelect={() => close()}
											/>
										)}
									/>
								</div>
							</div>
						);
					},
				},
				{
					id: "recursive-listbox",
					kind: "component",
					name: "Dropdown.Listbox recursive",
					label: "Three-level selection",
					related: relatedMap.Listbox,
					Render() {
						const [selectedValue, setSelectedValue] = useState("none");
						const [workspaceState, setWorkspaceState] = useState<
							"enabled" | "disabled" | "removed"
						>("enabled");
						const queueWorkspaceState = (nextState: "disabled" | "removed") => {
							setWorkspaceState("enabled");
							window.setTimeout(() => setWorkspaceState(nextState), 500);
						};
						const workspaceOption = {
							value: "workspace",
							content: <span className="truncate">Workspace</span>,
							disabled: workspaceState === "disabled",
							children: [
								{
									value: "design",
									content: <span className="truncate">Design</span>,
									children: [
										{
											value: "tokens",
											content: <span className="truncate">Tokens</span>,
										},
										{
											value: "components",
											content: <span className="truncate">Components</span>,
										},
									],
								},
								{
									value: "engineering",
									content: <span className="truncate">Engineering</span>,
									children: [
										{
											value: "web",
											content: <span className="truncate">Web</span>,
										},
										{
											value: "platform",
											content: <span className="truncate">Platform</span>,
										},
									],
								},
							],
						};
						const options = [
							...(workspaceState === "removed" ? [] : [workspaceOption]),
							{
								value: "disabled",
								content: <span className="truncate">Disabled branch</span>,
								disabled: true,
								children: [
									{
										value: "unavailable",
										content: <span className="truncate">Unavailable</span>,
									},
								],
							},
							{
								value: "overview",
								content: <span className="truncate">Overview</span>,
							},
							{
								value: "needs-review",
								content: <span className="truncate">Needs review</span>,
								tone: "warning" as const,
							},
							{
								value: "blocked",
								content: <span className="truncate">Blocked</span>,
								tone: "danger" as const,
							},
						];

						return (
							<div className="flex flex-col items-start gap-3">
								<Dropdown.Listbox
									ariaLabel="Choose recursive destination"
									onSelect={(value) => setSelectedValue(value)}
									options={options}
									positionStrategy="fixed"
									triggerContent={
										selectedValue === "none"
											? "Choose destination"
											: selectedValue
									}
								/>
								<Text variant="caption" tone="muted">
									Selected: {selectedValue}
								</Text>
								<div className="flex flex-wrap gap-2">
									<Button
										onClick={() => queueWorkspaceState("disabled")}
										size="sm"
									>
										Disable open branch
									</Button>
									<Button
										onClick={() => queueWorkspaceState("removed")}
										size="sm"
									>
										Remove open branch
									</Button>
								</div>
								<div className="w-full max-w-64">
									<Listbox
										options={options}
										onSelect={(option) => setSelectedValue(option.value)}
									/>
								</div>
							</div>
						);
					},
				},
			],
		},
	],
};
