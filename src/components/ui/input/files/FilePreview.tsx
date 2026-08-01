"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import * as React from "react";
import { resolveMotionTransition } from "@/components/ui/foundations/motionTiming";
import { Chip, type ChipTone } from "@/components/ui/misc/Chip";
import { InspectableImage } from "@/components/ui/misc/InspectableImage";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import { useConfirmationModal } from "@/components/ui/overlays/modal/useConfirmationModal";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { Text } from "@/components/ui/primitives/Text";
import { FileInspectModal } from "./FileInspectModal";

export type FilePreviewTag = {
	label: React.ReactNode;
	tone?: ChipTone;
};

export type FilePreviewLabels = {
	file?: React.ReactNode;
	pdf?: React.ReactNode;
	pending?: React.ReactNode;
	removeConfirmLabel?: string;
	removeDescription?: string;
	removeTitle?: string;
	removeWarning?: string;
	uploaded?: React.ReactNode;
};

type PendingItem = {
	key: string;
	status: "pending";
	type: string; // e.g. "image/png"
	url: string; // blob url
	name: string;
	tag?: FilePreviewTag;
	sortPriority?: number;
};

type UploadedItem = {
	key: string;
	status: "uploaded";
	url: string; // uploaded url
	name?: string;
	type?: string;
	unoptimized?: boolean;
	tag?: FilePreviewTag;
	sortPriority?: number;
};

export type FilePreviewItem = PendingItem | UploadedItem;

type PreviewShade = "dark" | "light";

type Props = {
	item: FilePreviewItem;
	index: number;

	// If you already have this helper, pass it in (keeps component generic)
	urlLooksLikeImage: (url: string) => boolean;
	urlLooksLikePdf?: (url: string) => boolean;

	// Disable interactions
	isDisabled?: boolean;

	// Hides the remove button entirely (regardless of disabled state)
	hideRemove?: boolean;

	// Preview item height in px (default 105)
	previewHeight?: number;

	// Called when user removes a pending item
	onRemovePending: (url: string) => void;

	// Called when user removes an uploaded item
	onRemoveUploaded: (url: string) => void;

	labels?: FilePreviewLabels;
	className?: string;
};

function FilePreviewRoot({
	item,
	index,
	urlLooksLikeImage,
	urlLooksLikePdf,
	isDisabled = false,
	hideRemove = false,
	previewHeight,
	onRemovePending,
	onRemoveUploaded,
	labels,
	className,
}: Props) {
	const isPending = item.status === "pending";
	const { openConfirmation } = useConfirmationModal("modal-root");
	const { openModal } = useModal();
	const fileType = "type" in item ? item.type : undefined;

	const isImage =
		fileType?.startsWith("image/") ||
		(!fileType && urlLooksLikeImage(item.url));
	const isPdf =
		fileType === "application/pdf" ||
		(!fileType && (urlLooksLikePdf?.(item.url) ?? false));
	const [sampledPreview, setSampledPreview] = React.useState<{
		shade: PreviewShade;
		url: string;
	} | null>(null);
	const previewShade = isPdf
		? "light"
		: sampledPreview?.url === item.url
			? sampledPreview.shade
			: undefined;
	const name = "name" in item && item.name ? item.name : nameFromUrl(item.url);
	const fileTypeLabel = isPdf
		? (labels?.pdf ?? "PDF")
		: (labels?.file ?? "File");

	const handleOpenFile = React.useCallback(() => {
		openModal(
			({ close }) => (
				<FileInspectModal
					url={item.url}
					name={name}
					type={isPdf ? "pdf" : "file"}
					onClose={close}
				/>
			),
			{
				ariaLabel: `${name} preview`,
				cardProps: { maxWidth: "4xl" },
			},
		);
	}, [isPdf, item.url, name, openModal]);

	return (
		<motion.div
			key={item.key}
			layout
			initial={{ opacity: 0, y: 6, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -6, scale: 0.98 }}
			transition={resolveMotionTransition("interaction")}
			style={
				previewHeight !== undefined ? { height: previewHeight } : undefined
			}
			className={[
				"relative w-auto aspect-video h-[105px] bg-background/10 border-border border overflow-hidden rounded-md flex items-center justify-center shrink-0",
				className,
			].join(" ")}
		>
			{isImage ? (
				<InspectableImage
					src={item.url}
					alt={`file-${index}`}
					disabled={isDisabled}
					unoptimized={item.status === "uploaded" && item.unoptimized}
					width={182}
					height={105}
					className="w-full h-full!"
					onLoad={(event) => {
						const shade = sampleMedianShade(event.currentTarget);
						if (shade) setSampledPreview({ shade, url: item.url });
					}}
				/>
			) : isPdf ? (
				<div className="relative h-full w-full">
					<div className="h-full w-full overflow-hidden rounded-[3px] bg-white shadow-[inset_0_0_0_1px_rgba(25,27,37,0.12)]">
						<object
							data={pdfPreviewUrl(item.url)}
							type="application/pdf"
							className="pointer-events-none h-full w-full"
							title={`${name} preview`}
						>
							<div className="flex h-full min-w-0 flex-col items-center justify-center gap-1 px-2 text-center">
								<Text as="span" variant="bodyStrong" className="block text-xs">
									{fileTypeLabel}
								</Text>
								<Text
									as="span"
									variant="caption"
									tone="muted"
									className="block max-w-full whitespace-normal break-words text-3xs"
								>
									{name}
								</Text>
							</div>
						</object>
					</div>
					<Button
						variant="ghost"
						size="none"
						align="center"
						className="absolute! inset-0! z-10 h-full! w-full! !rounded-md"
						aria-label={`Open ${name}`}
						disabled={isDisabled}
						onClick={handleOpenFile}
					/>
				</div>
			) : (
				<Button
					aria-label={`Open ${name}`}
					variant="ghost"
					size="none"
					align="center"
					className="h-full w-full !rounded-md p-2 text-sm font-medium"
					contentClassName="min-w-0 flex-col gap-1 whitespace-normal"
					disabled={isDisabled}
					onClick={handleOpenFile}
				>
					<Text as="span" variant="bodyStrong" className="block text-xs">
						{fileTypeLabel}
					</Text>
					<Text
						as="span"
						variant="caption"
						tone="muted"
						className="block max-w-full break-words text-3xs"
					>
						{name}
					</Text>
				</Button>
			)}

			<div className="absolute top-2 left-2 z-20 flex max-w-[125px] flex-wrap gap-1.5">
				<Chip
					tone={isPending ? "warning" : "success"}
					className="px-2 py-1 text-3xs font-medium leading-none backdrop-blur-sm"
				>
					{isPending
						? (labels?.pending ?? "Pending")
						: (labels?.uploaded ?? "Uploaded")}
				</Chip>
				{item.tag ? (
					<Chip
						tone={item.tag.tone ?? "neutral"}
						className="max-w-full px-2 py-1 text-3xs font-medium leading-none backdrop-blur-sm"
					>
						<span className="min-w-0 truncate">{item.tag.label}</span>
					</Chip>
				) : null}
			</div>

			{!hideRemove ? (
				<Button
					aria-label={`Remove ${name}`}
					variant="secondary"
					size="icon-sm"
					trailingIcon="cross"
					data-preview-shade={previewShade}
					className={clsx(
						"absolute! top-2! right-2 z-20",
						previewShade === "light" &&
							"!bg-black !text-white hover:!bg-black/80",
						previewShade === "dark" &&
							"!bg-white !text-black hover:!bg-white/80",
					)}
					onClick={(e) => {
						e.stopPropagation();
						if (isPending) {
							onRemovePending(item.url);
							return;
						}
						openConfirmation({
							title: labels?.removeTitle ?? "Remove file",
							description:
								labels?.removeDescription ??
								"This file will be removed from the upload list.",
							warning:
								labels?.removeWarning ??
								"This file will be lost forever, are you sure?",
							confirmLabel: labels?.removeConfirmLabel ?? "Remove",
							onConfirm: () => onRemoveUploaded(item.url),
						});
					}}
					disabled={isDisabled}
				/>
			) : null}
		</motion.div>
	);
}

function FilePreviewSkeleton({
	className,
	previewHeight = 105,
}: Pick<Props, "className" | "previewHeight">) {
	return (
		<Skeleton
			className={clsx("aspect-video w-auto shrink-0 rounded-md", className)}
			style={{ height: previewHeight }}
		/>
	);
}

export const FilePreview = Object.assign(FilePreviewRoot, {
	Skeleton: FilePreviewSkeleton,
});

function pdfPreviewUrl(url: string) {
	const [baseUrl] = url.split("#");
	return `${baseUrl}#page=1&view=Fit&zoom=page-fit&toolbar=0&navpanes=0&scrollbar=0`;
}

function nameFromUrl(url: string) {
	try {
		const parsed = new URL(url);
		const name = parsed.pathname.split("/").pop();
		return name ? decodeURIComponent(name) : url;
	} catch {
		return url.split("/").pop() ?? url;
	}
}

function sampleMedianShade(image: HTMLImageElement): PreviewShade | undefined {
	try {
		const canvas = document.createElement("canvas");
		canvas.width = 16;
		canvas.height = 16;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) return undefined;

		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
		const luminances: number[] = [];

		for (let index = 0; index < pixels.length; index += 4) {
			if (pixels[index + 3] < 128) continue;
			const red = linearizeColorChannel(pixels[index] / 255);
			const green = linearizeColorChannel(pixels[index + 1] / 255);
			const blue = linearizeColorChannel(pixels[index + 2] / 255);
			luminances.push(0.2126 * red + 0.7152 * green + 0.0722 * blue);
		}

		if (luminances.length === 0) return undefined;
		luminances.sort((a, b) => a - b);
		const median = luminances[Math.floor(luminances.length / 2)];
		return median > 0.179 ? "light" : "dark";
	} catch {
		return undefined;
	}
}

function linearizeColorChannel(channel: number) {
	return channel <= 0.04045
		? channel / 12.92
		: ((channel + 0.055) / 1.055) ** 2.4;
}
