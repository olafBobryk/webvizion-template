"use client";

import { useState } from "react";
import {
	CopyStatusIcon,
	useCopyAction,
} from "@/components/ui/helpers/useCopyAction";
import { Icon } from "@/components/ui/icons/Icon";
import {
	Accordion,
	CopyField,
	HealthCheckIndicator,
	ImageSwitcher,
	InspectableImage,
	Loader,
	PaginationControls,
	ProfilePicture,
	ProfilePictureStack,
	ScrollBorders,
	SegmentedControl,
	Skeleton,
	SocialLinks,
	StepIndicator,
	SuspenseBoundary,
	Tooltip,
} from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Dropdown } from "@/components/ui/primitives/dropdown";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import { DemoMediaFrame, imageSwitcherDemoImages } from "../mediaFixtures";
import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

function ShareReportDemo({ skeleton = false }: { skeleton?: boolean }) {
	return (
		<Card size="sm">
			<Card.Header>
				{skeleton ? (
					<>
						<Text.Skeleton as="h3" variant="headingSm">
							Share report
						</Text.Skeleton>
						<Text.Skeleton variant="body">
							Copy this link and send it to your team.
						</Text.Skeleton>
					</>
				) : (
					<>
						<Card.Title as="h3">Share report</Card.Title>
						<Card.Description>
							Copy this link and send it to your team.
						</Card.Description>
					</>
				)}
			</Card.Header>
			<Card.Content>
				{skeleton ? (
					<CopyField.Skeleton placeholder="https://example.com/reports/q1-summary" />
				) : (
					<CopyField value="https://example.com/reports/q1-summary" />
				)}
			</Card.Content>
			<Card.Footer className="justify-end">
				{skeleton ? (
					<Button.Skeleton variant="primary">Continue</Button.Skeleton>
				) : (
					<Button variant="primary">Continue</Button>
				)}
			</Card.Footer>
		</Card>
	);
}

function DropdownMenuDemo() {
	const [selectedAction, setSelectedAction] = useState("None");
	const selectAction = (label: string) => () => setSelectedAction(label);
	const recursiveOptions = [
		{
			id: "projects",
			label: "Projects",
			onSelect: selectAction("Projects branch"),
			children: [
				{
					id: "recent",
					label: "Recent",
					onSelect: selectAction("Recent branch"),
					children: [
						{
							id: "apollo",
							label: "Apollo",
							onSelect: selectAction("Apollo"),
						},
						{
							id: "borealis",
							label: "Borealis",
							onSelect: selectAction("Borealis"),
						},
					],
				},
				{
					id: "templates",
					label: "Templates",
					onSelect: selectAction("Templates"),
				},
			],
		},
		{
			id: "helper-factories",
			label: "Helper factories",
			onSelect: selectAction("Helper factories branch"),
			children: [
				{
					...Dropdown.menuOptions.open({
						href: "#dropdown-menu-contract-target",
					}),
					id: "helper-open-default",
					label: "Open — default icon",
				},
				{
					...Dropdown.menuOptions.open({
						href: "/internal/demo",
						leadingIcon: <Icon name="arrow-right" size="sm" />,
					}),
					id: "helper-open-custom-icon",
					label: "Open — custom icon",
				},
				{
					...Dropdown.menuOptions.edit({
						onSelect: selectAction("Edit helper"),
					}),
					id: "helper-edit",
				},
				{
					...Dropdown.menuOptions.edit({
						disabled: true,
						onSelect: selectAction("Disabled edit helper"),
					}),
					id: "helper-edit-disabled",
					label: "Edit — disabled",
				},
				{
					...Dropdown.menuOptions.warning({
						onSelect: selectAction("Warning helper"),
					}),
					id: "helper-warning",
				},
				{
					...Dropdown.menuOptions.warning({
						disabled: true,
						label: "Warning — disabled",
						onSelect: selectAction("Disabled warning helper"),
					}),
					id: "helper-warning-disabled",
				},
				{
					...Dropdown.menuOptions.delete({
						onSelect: selectAction("Delete helper"),
					}),
					id: "helper-delete",
				},
				{
					...Dropdown.menuOptions.delete({
						disabled: true,
						label: "Delete permanently — disabled",
						onSelect: selectAction("Disabled delete helper"),
					}),
					id: "helper-delete-disabled",
				},
				{
					...Dropdown.menuOptions.delete({
						label: "Delete — no handler",
					}),
					id: "helper-delete-without-handler",
				},
			],
		},
		{
			id: "states-and-tones",
			label: "States and tones",
			onSelect: selectAction("States and tones branch"),
			children: [
				{
					id: "default-action",
					label: "Default action",
					onSelect: selectAction("Default action"),
				},
				{
					active: true,
					id: "active-action",
					label: "Active action",
					onSelect: selectAction("Active action"),
				},
				{
					disabled: true,
					id: "disabled-action",
					label: "Disabled action",
					onSelect: selectAction("Disabled action"),
				},
				{
					id: "empty-children-leaf",
					label: "Empty children — leaf",
					onSelect: selectAction("Empty children leaf"),
					children: [],
				},
				{
					id: "warning-action",
					label: "Warning action",
					leadingIcon: <Icon name="warning" size="sm" />,
					onSelect: selectAction("Warning action"),
					tone: "warning" as const,
				},
				{
					disabled: true,
					id: "disabled-warning-action",
					label: "Warning action — disabled",
					onSelect: selectAction("Disabled warning action"),
					tone: "warning" as const,
				},
				{
					id: "danger-action",
					label: "Danger action",
					onSelect: selectAction("Danger action"),
					tone: "danger" as const,
				},
				{
					disabled: true,
					id: "disabled-danger-action",
					label: "Danger action — disabled",
					onSelect: selectAction("Disabled danger action"),
					tone: "danger" as const,
				},
			],
		},
		{
			id: "composition",
			label: "Composition",
			onSelect: selectAction("Composition branch"),
			children: [
				{
					dividerAfter: true,
					id: "leading-icon",
					label: "Leading icon + divider after",
					leadingIcon: <Icon name="gear" size="sm" />,
					onSelect: selectAction("Leading icon"),
				},
				{
					id: "trailing-icon",
					label: "Trailing icon",
					onSelect: selectAction("Trailing icon"),
					trailingIcon: <Icon name="arrow-right" size="sm" />,
				},
				{
					dividerBefore: true,
					id: "both-icons",
					label: "Both icons + divider before",
					leadingIcon: <Icon name="archive" size="sm" />,
					onSelect: selectAction("Both icons"),
					trailingIcon: <Icon name="check" size="sm" />,
				},
				{
					className: "font-medium",
					id: "class-extensions",
					label: "Class extensions",
					onSelect: selectAction("Class extensions"),
					textClassName: "uppercase tracking-wide",
				},
				{
					id: "presentation-layout",
					label: (
						<span className="flex min-w-0 flex-col">
							<span className="font-medium">Presentation layout</span>
							<span className="text-xs text-muted/60">
								Multi-line React node label
							</span>
						</span>
					),
					layout: "presentation" as const,
					onSelect: selectAction("Presentation layout"),
				},
			],
		},
		{
			id: "disabled-branch",
			label: "Disabled branch",
			disabled: true,
			children: [
				{
					id: "disabled-branch-child",
					label: "Unreachable child",
					onSelect: selectAction("Unreachable child"),
				},
			],
		},
		{
			id: "settings",
			label: "Settings",
			onSelect: selectAction("Settings"),
		},
	];

	return (
		<div className="flex flex-col items-start gap-3">
			<div className="flex flex-wrap items-end gap-6">
				<div className="flex flex-col items-start gap-1.5">
					<Text variant="caption" tone="muted">
						Flat baseline
					</Text>
					<Dropdown.Menu
						ariaLabel="Open overflow menu"
						options={[
							{ label: "Edit", href: "/" },
							{ label: "Duplicate", onSelect: () => {} },
							{ label: "Archive", onSelect: () => {} },
						]}
					/>
				</div>
				<div className="flex flex-col items-start gap-1.5">
					<Text variant="caption" tone="muted">
						Recursive contract matrix
					</Text>
					<Dropdown.Menu
						ariaLabel="Open recursive action menu"
						openOnHover={false}
						options={recursiveOptions}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-0.5">
				<Text id="dropdown-menu-contract-target" variant="caption" tone="muted">
					Selected: {selectedAction}
				</Text>
				<Text variant="caption" tone="muted">
					Supported tones: default, warning, and danger.
				</Text>
			</div>
		</div>
	);
}

export const uiMiscDemoPage: DemoPage = {
	id: "ui-misc",
	slug: ["ui", "misc"],
	title: "UI Misc",
	description: "Helpers + states",
	groups: [
		{
			id: "misc-feedback",
			title: "Misc & Feedback",
			description: "Helpers + states",
			items: [
				{
					id: "accordion",
					kind: "component",
					name: "Accordion",
					label: "Disclosure",
					related: relatedMap.Accordion,
					Render() {
						const [cardOpen, setCardOpen] = useState(true);

						return (
							<div className="grid gap-6">
								<div className="grid gap-2">
									<Accordion
										description="Closed without a leading icon."
										title="Compact disclosure"
									>
										This borderless row is closed by default.
									</Accordion>
									<Accordion
										defaultOpen
										description="Open with a leading icon."
										icon={<Icon name="info" size="sm" />}
										title="Open disclosure"
									>
										Open content keeps the same horizontal edge as its trigger.
									</Accordion>
									<Accordion title="Disabled disclosure" disabled>
										Disabled content.
									</Accordion>
									<Accordion.Skeleton
										description="Closed without a leading icon."
										title="Compact disclosure"
									/>
									<Accordion.Skeleton
										description="Open with a leading icon."
										leadingIcon
										open
										title="Open disclosure"
									>
										<Text.Skeleton tone="muted" variant="support">
											Open content keeps the same horizontal edge as its
											trigger.
										</Text.Skeleton>
									</Accordion.Skeleton>
									<Accordion.Skeleton
										title="Skeleton without a trailing icon"
										trailingIcon={false}
									/>
								</div>
								<Accordion.Card onOpenChange={setCardOpen} open={cardOpen}>
									<Accordion.Header className="border-b">
										<Accordion.Title>Collapsible Card</Accordion.Title>
										<Accordion.Description>
											Card slots keep their normal geometry while content and
											footer collapse together.
										</Accordion.Description>
										<Accordion.Action>
											<Button size="sm">Review</Button>
										</Accordion.Action>
									</Accordion.Header>
									<Accordion.Content>
										<Text tone="muted" variant="support">
											The chevron alone controls this structured disclosure.
										</Text>
									</Accordion.Content>
									<Accordion.Footer className="justify-end">
										<Button size="sm" variant="primary">
											Continue
										</Button>
									</Accordion.Footer>
								</Accordion.Card>
								<Accordion.Card disabled>
									<Accordion.Header>
										<Accordion.Title>Disabled Card</Accordion.Title>
										<Accordion.Description>
											Its disclosure control remains unavailable.
										</Accordion.Description>
									</Accordion.Header>
									<Accordion.Content>Disabled content.</Accordion.Content>
								</Accordion.Card>
								<Accordion.Card.Skeleton
									action={<Button.Skeleton size="sm">Review</Button.Skeleton>}
									description="Card slots keep their normal geometry while content and footer collapse together."
									footer={
										<Button.Skeleton size="sm" variant="primary">
											Continue
										</Button.Skeleton>
									}
									footerClassName="justify-end"
									headerClassName="border-b"
									open
									title="Collapsible Card"
								/>
								<Accordion.Card.Skeleton
									description="A structural Card skeleton can omit the disclosure icon."
									title="No trailing caret"
									trailingIcon={false}
								/>
							</div>
						);
					},
				},
				{
					id: "step-indicator",
					kind: "component",
					name: "StepIndicator",
					label: "Modal workflow steps",
					Render() {
						const [step, setStep] = useState("details");
						return (
							<StepIndicator
								currentStep={step}
								onStepChange={setStep}
								steps={[
									{ id: "details", label: "Details" },
									{ id: "review", label: "Review" },
									{ id: "finish", label: "Finish" },
								]}
							/>
						);
					},
				},
				{
					id: "segmented-control",
					kind: "component",
					name: "SegmentedControl",
					label: "Segmented control",
					related: relatedMap.SegmentedControl,
					Render() {
						const [segment, setSegment] = useState("overview");
						const [segmentAlt, setSegmentAlt] = useState("alerts");

						return (
							<div className="flex flex-col gap-2">
								<SegmentedControl
									options={[
										{ value: "overview", label: "Overview" },
										{ value: "insights", label: "Insights" },
										{ value: "alerts", label: "Alerts" },
									]}
									value={segment}
									onChange={setSegment}
								/>
								<SegmentedControl
									options={[
										{ value: "overview", label: "Overview" },
										{ value: "insights", label: "Insights" },
										{ value: "alerts", label: "Alerts", disabled: true },
									]}
									value={segmentAlt}
									onChange={setSegmentAlt}
									layout="auto"
									roundedFull
								/>
							</div>
						);
					},
				},
				{
					id: "copy-field",
					kind: "component",
					name: "CopyField",
					label: "Copy helper",
					related: relatedMap.CopyField,
					Render() {
						return (
							<div className="grid gap-2">
								<CopyField value="https://example.com/copy" />
								<CopyField
									value="+31 20 123 4567"
									type="phone"
									showIcon={false}
								/>
							</div>
						);
					},
					skeleton: {
						name: "CopyField.Skeleton",
						Render() {
							return (
								<CopyField.Skeleton placeholder="https://example.com/copy" />
							);
						},
					},
				},
				{
					id: "copy-action",
					kind: "component",
					name: "useCopyAction",
					label: "Copy action hook",
					related: relatedMap.useCopyAction,
					Render() {
						const { copied, handleCopy } = useCopyAction({
							value: "template-copy-value",
							toastMessage: "Copied template value",
						});

						return (
							<div className="flex flex-col gap-2">
								<Button
									size="sm"
									variant="secondary"
									onClick={() => {
										void handleCopy();
									}}
									trailingIcon={<CopyStatusIcon copied={copied} />}
								>
									{copied ? "Copied" : "Copy value"}
								</Button>
								<Text variant="caption" tone="muted">
									Shared hook plus status icon for copy affordances outside
									CopyField.
								</Text>
							</div>
						);
					},
				},
				{
					id: "social-links",
					kind: "component",
					name: "SocialLinks",
					label: "Social links",
					related: relatedMap.SocialLinks,
					Render() {
						const links = [
							{
								href: "https://instagram.com/example",
								label: "Instagram",
							},
							{ href: "https://x.com/example", label: "X" },
							{
								href: "https://linkedin.com/company/example",
								label: "LinkedIn",
							},
							{
								href: "https://youtube.com/@example",
								label: "YouTube",
							},
						];

						return (
							<div className="flex flex-col gap-3">
								<SocialLinks links={links} />
								<SocialLinks links={links.slice(0, 3)} showLabels size="sm" />
							</div>
						);
					},
				},
				{
					id: "dropdown-menu",
					kind: "component",
					name: "Dropdown.Menu",
					label: "Overflow menu",
					related: relatedMap.Dropdown,
					Render() {
						return <DropdownMenuDemo />;
					},
				},
				{
					id: "pagination-controls",
					kind: "component",
					name: "PaginationControls",
					label: "Compact pager",
					related: relatedMap.PaginationControls,
					Render() {
						const [page, setPage] = useState(3);
						const total = 8;

						return (
							<PaginationControls
								current={page}
								total={total}
								onPrev={() => setPage((value) => Math.max(1, value - 1))}
								onNext={() => setPage((value) => Math.min(total, value + 1))}
								disablePrev={page <= 1}
								disableNext={page >= total}
							/>
						);
					},
				},
				{
					id: "image-switcher",
					kind: "component",
					name: "ImageSwitcher",
					label: "Preloaded image switcher",
					related: relatedMap.ImageSwitcher,
					Render() {
						return (
							<ImageSwitcher
								images={imageSwitcherDemoImages}
								frameClassName="h-64 max-w-xl"
								imageClassName="object-cover"
								controlsClassName="justify-center"
								paginationButtonSize="icon"
								preserveIconDirection
								sizes="(min-width: 768px) 36rem, 100vw"
							/>
						);
					},
				},
				{
					id: "scroll-borders",
					kind: "component",
					name: "ScrollBorders",
					label: "Scrollable edge affordances",
					related: relatedMap.ScrollBorders,
					Render() {
						return (
							<ScrollBorders className="h-40 overflow-y-auto bg-surface px-4 py-3">
								<div className="flex flex-col gap-3">
									{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sectionNumber) => (
										<Panel
											key={`scroll-borders-demo-${sectionNumber}`}
											background="background"
											border="subtle"
											gap="none"
											padding="xs"
											radius="xs"
											shadow="none"
										>
											<Text as="p" variant="bodyStrong">
												Section {sectionNumber}
											</Text>
											<Text as="p" variant="body" tone="muted">
												Keep longer scroll regions readable without inventing
												page-local chrome.
											</Text>
										</Panel>
									))}
								</div>
							</ScrollBorders>
						);
					},
					skeleton: {
						name: "ScrollBorders.Skeleton",
						related: relatedMap.ScrollBorders,
						Render() {
							return (
								<ScrollBorders.Skeleton className="h-40 rounded-lg bg-surface px-4 py-3">
									<div className="flex flex-col gap-3">
										{[1, 2, 3, 4, 5].map((sectionNumber) => (
											<Panel
												key={`scroll-borders-skeleton-${sectionNumber}`}
												background="background"
												border="subtle"
												gap="none"
												padding="xs"
												radius="xs"
												shadow="none"
											>
												<Text.Skeleton as="p" variant="bodyStrong">
													Section {sectionNumber}
												</Text.Skeleton>
												<Text.Skeleton as="p" variant="body">
													Keep longer scroll regions readable without inventing
													page-local chrome.
												</Text.Skeleton>
											</Panel>
										))}
									</div>
								</ScrollBorders.Skeleton>
							);
						},
					},
				},
				{
					id: "tooltip",
					kind: "component",
					name: "Tooltip",
					label: "Hover helper",
					related: relatedMap.Tooltip,
					Render() {
						return (
							<Tooltip content="Search the shared component library.">
								<Button size="sm" variant="secondary">
									Library tip
								</Button>
							</Tooltip>
						);
					},
				},
				{
					id: "loader",
					kind: "component",
					name: "Loader",
					label: "Spinner",
					related: relatedMap.Loader,
					Render() {
						return (
							<div className="flex gap-2">
								<Loader className="text-primary" />
								<Loader className="text-muted-foreground" />
							</div>
						);
					},
				},
				{
					id: "health-check-indicator",
					kind: "component",
					name: "HealthCheckIndicator",
					label: "Service status",
					related: relatedMap.HealthCheckIndicator,
					Render() {
						return (
							<div className="flex flex-col items-start gap-2">
								<HealthCheckIndicator label="Supabase" />
								<HealthCheckIndicator label="Supabase" variant="sm" />
							</div>
						);
					},
				},
				{
					id: "profile-picture",
					kind: "component",
					name: "ProfilePicture",
					label: "Avatar display",
					related: relatedMap.ProfilePicture,
					Render() {
						return (
							<div className="grid gap-4">
								<div className="flex flex-wrap items-center gap-3">
									<ProfilePicture name="Ada Lovelace" size="sm" />
									<ProfilePicture name="Grace Hopper" />
									<ProfilePicture name="Unknown user" size="lg" />
									<ProfilePicture fallback="AL" name="Ada Lovelace" size="xl" />
									<ProfilePicture size="2xl" />
								</div>
							</div>
						);
					},
					skeleton: {
						name: "ProfilePicture.Skeleton",
						related: relatedMap.ProfilePicture,
						Render() {
							return (
								<div className="flex items-center gap-3">
									<ProfilePicture loading size="sm" />
									<ProfilePicture loading />
									<ProfilePicture loading size="lg" />
									<ProfilePicture loading size="2xl" />
								</div>
							);
						},
					},
				},
				{
					id: "profile-picture-stack",
					kind: "component",
					name: "ProfilePictureStack",
					label: "Collaborator group",
					related: relatedMap.ProfilePicture,
					Render() {
						return (
							<div className="scroll-target" id="profile-picture-stack">
								<ProfilePictureStack
									ariaLabel="Project collaborators"
									items={[
										{
											fallback: "AL",
											helperIndex: 0,
											id: "ada-lovelace",
											name: "Ada Lovelace",
										},
										{
											fallback: "GH",
											helperIndex: 2,
											id: "grace-hopper",
											name: "Grace Hopper",
										},
										{
											fallback: "KJ",
											helperIndex: 4,
											id: "katherine-johnson",
											name: "Katherine Johnson",
										},
										{
											fallback: "HM",
											helperIndex: 6,
											id: "hedy-lamarr",
											name: "Hedy Lamarr",
										},
									]}
								/>
							</div>
						);
					},
				},
				{
					id: "skeleton",
					kind: "component",
					name: "Skeleton",
					label: "Skeleton block",
					related: relatedMap.Skeleton,
					Render() {
						return (
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-2">
									<Skeleton className="h-6 w-32" />
									<Skeleton className="size-6" radius="full" />
								</div>
								<Text.Skeleton variant="body">Skeleton text</Text.Skeleton>
							</div>
						);
					},
				},
				{
					id: "suspense-boundary",
					kind: "component",
					name: "SuspenseBoundary",
					label: "Default + ghost loading",
					related: relatedMap.SuspenseBoundary,
					Render() {
						const [contentState, setContentState] = useState<
							"loading" | "error" | "ready"
						>("ready");

						return (
							<div className="flex flex-col gap-2">
								<div className="flex gap-2">
									<Button size="sm" onClick={() => setContentState("loading")}>
										Loading
									</Button>
									<Button
										size="sm"
										variant="secondary"
										onClick={() => setContentState("error")}
									>
										Error
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setContentState("ready")}
									>
										Ready
									</Button>
								</div>
								<div className="grid gap-3 lg:grid-cols-2">
									<div className="flex flex-col gap-2">
										<Text variant="caption" tone="muted">
											Default fallback
										</Text>
										<SuspenseBoundary
											loading={contentState === "loading"}
											error={contentState === "error"}
											fallback={
												<div className="flex items-center justify-center py-10">
													<Loader />
												</div>
											}
										>
											<ShareReportDemo />
										</SuspenseBoundary>
									</div>
									<div className="flex flex-col gap-2">
										<Text variant="caption" tone="muted">
											Ghost fallback
										</Text>
										<SuspenseBoundary
											loading={contentState === "loading"}
											error={contentState === "error"}
											ghost
											fallback={<ShareReportDemo skeleton />}
										>
											<ShareReportDemo />
										</SuspenseBoundary>
									</div>
								</div>
							</div>
						);
					},
				},
				{
					id: "inspectable-image",
					kind: "component",
					name: "InspectableImage",
					label: "Image inspect",
					related: relatedMap.InspectableImage,
					Render() {
						return (
							<DemoMediaFrame>
								<InspectableImage
									src="/test/blob.png"
									alt="Preview"
									width={120}
									height={80}
								/>
							</DemoMediaFrame>
						);
					},
				},
			],
		},
	],
};
