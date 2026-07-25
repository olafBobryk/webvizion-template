import clsx from "clsx";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text, type TextProps } from "@/components/ui/primitives/Text";
import {
	InternalPage,
	InternalPageHeader,
} from "../../_components/InternalPage";

type ToastDemoTone = "loading" | "success" | "error";

type ToastTypographyOption = {
	id: string;
	name: string;
	description: string;
	titleVariant: TextProps["variant"];
	messageVariant: TextProps["variant"];
	gapClassName: string;
	titleClassName?: string;
	messageClassName?: string;
};

const typographyOptions: ToastTypographyOption[] = [
	{
		id: "current",
		name: "Previous",
		description: "Original heavier hierarchy from the previous toast pass.",
		titleVariant: "headingXs",
		messageVariant: "body",
		gapClassName: "gap-1",
	},
	{
		id: "compact-strong",
		name: "Compact Strong (Live)",
		description:
			"Current live choice with tighter separation and smaller copy.",
		titleVariant: "bodyStrong",
		messageVariant: "caption",
		gapClassName: "gap-0.5",
	},
	{
		id: "quiet-ui",
		name: "Quiet UI",
		description: "Lower contrast hierarchy for a lighter transient surface.",
		titleVariant: "body",
		messageVariant: "caption",
		gapClassName: "gap-[2px]",
		titleClassName: "font-semibold",
	},
	{
		id: "body-read",
		name: "Body Read",
		description: "More readable message copy with a familiar app body rhythm.",
		titleVariant: "bodyStrong",
		messageVariant: "body",
		gapClassName: "gap-[3px]",
	},
	{
		id: "caption-tight",
		name: "Caption Tight",
		description: "Smallest compact treatment for low-priority feedback.",
		titleVariant: "caption",
		messageVariant: "caption",
		gapClassName: "gap-0",
		titleClassName: "font-semibold",
	},
];

const samples: Array<{
	tone: ToastDemoTone;
	title: string;
	message: string;
}> = [
	{
		tone: "loading",
		title: "Saving",
		message: "Saving changes...",
	},
	{
		tone: "success",
		title: "Success",
		message: "Message sent.",
	},
	{
		tone: "error",
		title: "Failed",
		message: "Message could not be sent.",
	},
];

function getIndicatorClasses(tone: ToastDemoTone) {
	switch (tone) {
		case "success":
			return {
				text: "text-success",
				fill: "bg-success",
				icon: "check",
				iconColor: "text-white",
			};
		case "error":
			return {
				text: "text-danger",
				fill: "bg-danger",
				icon: "close",
				iconColor: "text-white",
			};
		case "loading":
			return {
				text: "text-foreground/70",
				fill: "bg-foreground/70",
				icon: null,
				iconColor: "text-transparent",
			};
	}
}

function StaticToastIndicator({ tone }: { tone: ToastDemoTone }) {
	const indicator = getIndicatorClasses(tone);
	const isLoading = tone === "loading";

	return (
		<div
			className={clsx(
				"relative h-8 w-8 shrink-0 overflow-hidden rounded-full",
				indicator.text,
			)}
		>
			<div className="absolute inset-0 rounded-full bg-foreground/10" />
			<div
				className={clsx(
					"absolute inset-0 rounded-full",
					isLoading
						? clsx(indicator.text, "animate-spin-smooth")
						: indicator.fill,
				)}
				style={
					isLoading
						? {
								background:
									"conic-gradient(currentColor 0deg 112deg, transparent 112deg 360deg)",
							}
						: undefined
				}
			/>
			{isLoading ? (
				<div className="absolute inset-[4px] rounded-full bg-surface" />
			) : null}
			{indicator.icon ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<Icon
						name={indicator.icon}
						size="sm"
						className={clsx(
							indicator.iconColor,
							tone === "error" ? "h-2.5 w-2.5" : "",
						)}
					/>
				</div>
			) : null}
		</div>
	);
}

function ToastSample({
	option,
	sample,
}: {
	option: ToastTypographyOption;
	sample: (typeof samples)[number];
}) {
	return (
		<Panel
			background="surface"
			border="default"
			padding="sm"
			radius="sm"
			shadow="none"
		>
			<div className="flex min-w-0 items-start gap-3">
				<StaticToastIndicator tone={sample.tone} />
				<div
					className={clsx("flex min-w-0 flex-1 flex-col", option.gapClassName)}
				>
					<Text
						as="p"
						variant={option.titleVariant}
						className={option.titleClassName}
					>
						{sample.title}
					</Text>
					<Text
						as="p"
						variant={option.messageVariant}
						tone="muted"
						className={clsx(
							"text-left break-words whitespace-normal",
							option.messageClassName,
						)}
					>
						{sample.message}
					</Text>
				</div>
				<Button
					type="button"
					aria-label="Dismiss toast"
					size="icon-sm"
					variant="ghost"
					className="-mr-1 -mt-1 text-foreground/50"
				>
					<Icon name="close" size="sm" />
				</Button>
			</div>
		</Panel>
	);
}

export default function ToastPlaygroundPage() {
	return (
		<InternalPage className="gap-8">
			<InternalPageHeader
				title="Toast hierarchy"
				description="Compare title and message hierarchy on the circular-indicator toast."
				action={
					<Button
						href="/internal/playground"
						size="sm"
						variant="ghost"
						className="self-start"
					>
						Back to playground
					</Button>
				}
			/>

			<div className="grid gap-8">
				{typographyOptions.map((option) => (
					<section key={option.id} className="grid gap-3">
						<div className="flex flex-col gap-1">
							<Text as="h2" variant="headingSm">
								{option.name}
							</Text>
							<Text variant="body" tone="muted">
								{option.description}
							</Text>
							<Text variant="caption" tone="muted">
								{option.titleVariant} / {option.messageVariant} /{" "}
								{option.gapClassName}
							</Text>
						</div>

						<div className="grid gap-3 lg:grid-cols-3">
							{samples.map((sample) => (
								<ToastSample
									key={`${option.id}-${sample.tone}`}
									option={option}
									sample={sample}
								/>
							))}
						</div>
					</section>
				))}
			</div>
		</InternalPage>
	);
}
