"use client";

import clsx from "clsx";
import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Skeleton } from "@/components/ui/misc/Skeleton";
import { IdleState } from "@/components/ui/misc/state/IdleState";
import { Button } from "@/components/ui/primitives/Button";
import { Field } from "@/components/ui/primitives/Field";
import {
	FilePreview,
	type FilePreviewItem,
	type FilePreviewLabels,
	type FilePreviewTag,
} from "./FilePreview";

export type FileInputPendingItem = {
	file: File;
	key?: string;
	sortPriority?: number;
	status: "pending";
	tag?: FilePreviewTag;
};

export type FileInputUploadedItem = {
	key?: string;
	name?: string;
	sortPriority?: number;
	status: "uploaded";
	tag?: FilePreviewTag;
	type?: string;
	unoptimized?: boolean;
	url: string;
};

export type FileInputItem = FileInputPendingItem | FileInputUploadedItem;

export type FileInputLabels = FilePreviewLabels & {
	add?: React.ReactNode;
	emptyDescription?: React.ReactNode;
	emptyTitle?: React.ReactNode;
};

export type FileInputProps = {
	accept?: string;
	capture?: "environment" | "user";
	className?: string;
	description?: React.ReactNode;
	disabled?: boolean;
	error?: React.ReactNode;
	id?: string;
	inputName?: string;
	items: FileInputItem[];
	label?: React.ReactNode;
	labels?: FileInputLabels;
	mode?: "edit" | "read";
	multiple?: boolean;
	onFilesRejected?: (files: File[]) => void;
	onItemsChange: (items: FileInputItem[]) => void;
	previewHeight?: number;
	required?: boolean;
	/** Bump to clear pending files and the native input while retaining uploaded items. */
	resetSignal?: number;
	showAddControl?: boolean;
};

type PendingPreview = {
	item: FileInputPendingItem;
	key: string;
	url: string;
};

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
	avif: "image/avif",
	bmp: "image/bmp",
	csv: "text/csv",
	doc: "application/msword",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	gif: "image/gif",
	heic: "image/heic",
	heif: "image/heif",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	json: "application/json",
	m4a: "audio/mp4",
	mov: "video/quicktime",
	mp3: "audio/mpeg",
	mp4: "video/mp4",
	pdf: "application/pdf",
	png: "image/png",
	ppt: "application/vnd.ms-powerpoint",
	pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	svg: "image/svg+xml",
	txt: "text/plain",
	wav: "audio/wav",
	webm: "video/webm",
	webp: "image/webp",
	xls: "application/vnd.ms-excel",
	xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	zip: "application/zip",
};

function fileExtension(fileName: string) {
	const match = /\.([^.]+)$/.exec(fileName.toLowerCase());
	return match?.[1] ?? "";
}

function fileMatchesAccept(file: File, accept: string) {
	const acceptedTypes = accept
		.split(",")
		.map((value) => value.trim().toLowerCase())
		.filter(Boolean);
	if (acceptedTypes.length === 0) return true;

	const extension = fileExtension(file.name);
	const fileType =
		file.type.toLowerCase() || MIME_TYPES_BY_EXTENSION[extension] || "";

	return acceptedTypes.some((acceptedType) => {
		if (acceptedType.startsWith(".")) {
			return file.name.toLowerCase().endsWith(acceptedType);
		}
		if (acceptedType.endsWith("/*")) {
			return fileType.startsWith(acceptedType.slice(0, -1));
		}
		return fileType === acceptedType;
	});
}

function pendingItemKey(item: FileInputPendingItem, index: number) {
	return (
		item.key ??
		`${item.file.name}-${item.file.size}-${item.file.lastModified}-${index}`
	);
}

function uploadedItemKey(item: FileInputUploadedItem, index: number) {
	return item.key ?? `uploaded:${item.url}:${index}`;
}

function urlLooksLikeImage(url: string) {
	const base = url.split("?")[0] ?? url;
	return /\.(png|jpg|jpeg|webp|gif|avif|svg)$/i.test(base);
}

function urlLooksLikePdf(url: string) {
	const base = url.split("?")[0] ?? url;
	return /\.pdf$/i.test(base);
}

function FileInputRoot({
	accept = "image/*,application/pdf",
	capture,
	className,
	description,
	disabled = false,
	error,
	id,
	inputName,
	items,
	label = "Files",
	labels,
	mode = "edit",
	multiple = true,
	onFilesRejected,
	onItemsChange,
	previewHeight = 105,
	required = false,
	resetSignal,
	showAddControl = true,
}: FileInputProps) {
	const generatedId = React.useId();
	const inputId = id ?? inputName ?? generatedId;
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = React.useState(false);
	const [validationError, setValidationError] = React.useState<string | null>(
		null,
	);
	const [pendingPreviews, setPendingPreviews] = React.useState<
		PendingPreview[]
	>([]);
	const previousResetSignalRef = React.useRef(resetSignal);
	const pendingItems = items.filter(
		(item): item is FileInputPendingItem => item.status === "pending",
	);
	const pendingItemsRef = React.useRef(pendingItems);
	pendingItemsRef.current = pendingItems;
	const pendingSignature = pendingItems
		.map((item, index) => pendingItemKey(item, index))
		.join("\n");
	const descriptionId = description ? `${inputId}-description` : undefined;
	const fieldError = error ?? validationError;
	const messageId = fieldError ? `${inputId}-message` : undefined;
	const describedBy =
		[descriptionId, messageId].filter(Boolean).join(" ") || undefined;
	const isEditable = mode === "edit";
	const isAtCapacity = !multiple && items.length > 0;
	const showAdd = isEditable && !isAtCapacity && showAddControl;
	const tone = fieldError ? "error" : "default";

	// biome-ignore lint/correctness/useExhaustiveDependencies: recreate object URLs only when the controlled pending-file signature changes
	React.useEffect(() => {
		const previews = pendingItemsRef.current.map((item, index) => ({
			item,
			key: pendingItemKey(item, index),
			url: URL.createObjectURL(item.file),
		}));
		setPendingPreviews(previews);
		return () => {
			for (const preview of previews) URL.revokeObjectURL(preview.url);
		};
	}, [pendingSignature]);

	const resetSelection = React.useCallback(() => {
		if (inputRef.current) inputRef.current.value = "";
		setIsDragging(false);
		setValidationError(null);
		if (isEditable) {
			onItemsChange(items.filter((item) => item.status === "uploaded"));
		}
	}, [isEditable, items, onItemsChange]);

	React.useEffect(() => {
		if (resetSignal === undefined) return;
		if (previousResetSignalRef.current === resetSignal) return;
		previousResetSignalRef.current = resetSignal;
		resetSelection();
	}, [resetSelection, resetSignal]);

	React.useEffect(() => {
		const form = inputRef.current?.form;
		if (!form) return;
		form.addEventListener("reset", resetSelection);
		return () => form.removeEventListener("reset", resetSelection);
	}, [resetSelection]);

	function addFiles(nextFiles: FileList | File[]) {
		if (disabled || !isEditable || isAtCapacity) return;
		const incoming = Array.from(nextFiles);
		if (incoming.length === 0) return;
		const acceptedFiles = incoming.filter((file) =>
			fileMatchesAccept(file, accept),
		);
		const rejectedFiles = incoming.filter(
			(file) => !fileMatchesAccept(file, accept),
		);

		if (rejectedFiles.length > 0) {
			setValidationError(
				rejectedFiles.length === 1
					? `${rejectedFiles[0]?.name ?? "The file"} is not an accepted file type.`
					: `${rejectedFiles.length} files were not added because their types are not accepted.`,
			);
			onFilesRejected?.(rejectedFiles);
		} else {
			setValidationError(null);
		}

		const filesToAdd = multiple ? acceptedFiles : acceptedFiles.slice(0, 1);
		if (filesToAdd.length === 0) return;
		onItemsChange([
			...items,
			...filesToAdd.map(
				(file): FileInputPendingItem => ({ file, status: "pending" }),
			),
		]);
	}

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (event.currentTarget.files) addFiles(event.currentTarget.files);
		event.currentTarget.value = "";
	}

	function handleDragEnter(event: React.DragEvent<HTMLFieldSetElement>) {
		event.preventDefault();
		event.stopPropagation();
		if (!disabled && showAdd) setIsDragging(true);
	}

	function handleDragOver(event: React.DragEvent<HTMLFieldSetElement>) {
		event.preventDefault();
		event.stopPropagation();
		if (!disabled && showAdd) setIsDragging(true);
	}

	function handleDragLeave(event: React.DragEvent<HTMLFieldSetElement>) {
		event.preventDefault();
		event.stopPropagation();
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
			setIsDragging(false);
		}
	}

	function handleDrop(event: React.DragEvent<HTMLFieldSetElement>) {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);
		if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
	}

	const previewItems = items
		.map((item, index): FilePreviewItem | null => {
			if (item.status === "uploaded") {
				return {
					...item,
					key: uploadedItemKey(item, index),
				};
			}
			const preview = pendingPreviews.find((entry) => entry.item === item);
			if (!preview) return null;
			return {
				key: `pending:${preview.key}`,
				name: item.file.name,
				sortPriority: item.sortPriority,
				status: "pending",
				tag: item.tag,
				type: item.file.type,
				url: preview.url,
			};
		})
		.filter((item): item is FilePreviewItem => item !== null)
		.sort(
			(a, b) =>
				(a.sortPriority ?? Number.MAX_SAFE_INTEGER) -
				(b.sortPriority ?? Number.MAX_SAFE_INTEGER),
		);

	return (
		<Field
			className={className}
			description={description}
			descriptionId={descriptionId}
			inputId={inputId}
			label={label}
			message={fieldError}
			messageId={messageId}
			required={required}
			tone={tone}
		>
			<input
				accept={accept}
				aria-describedby={describedBy}
				aria-invalid={Boolean(fieldError)}
				capture={capture}
				disabled={disabled || !isEditable}
				hidden
				id={inputId}
				multiple={multiple}
				name={inputName}
				onChange={handleFileChange}
				ref={inputRef}
				type="file"
			/>
			{items.length === 0 && !showAdd ? (
				<IdleState
					description={
						labels?.emptyDescription ?? "Uploaded files will appear here."
					}
					layout="stacked"
					title={labels?.emptyTitle ?? "No files yet"}
				/>
			) : (
				<fieldset
					aria-label={
						typeof label === "string" ? `${label} file list` : "File list"
					}
					className="m-0 min-w-0 max-w-full overflow-x-auto rounded-md border-0 p-0"
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<div className="flex w-max gap-3 overscroll-x-contain [-webkit-overflow-scrolling:touch]">
						{previewItems.map((item, index) => (
							<FilePreview
								hideRemove={!isEditable}
								index={index}
								isDisabled={disabled}
								item={item}
								key={item.key}
								labels={labels}
								onRemovePending={(url) => {
									const preview = pendingPreviews.find(
										(entry) => entry.url === url,
									);
									if (!preview) return;
									onItemsChange(
										items.filter((candidate) => candidate !== preview.item),
									);
								}}
								onRemoveUploaded={(url) => {
									const uploadedItem = items.find(
										(candidate, candidateIndex) =>
											candidate.status === "uploaded" &&
											uploadedItemKey(candidate, candidateIndex) === item.key &&
											candidate.url === url,
									);
									if (!uploadedItem) return;
									onItemsChange(
										items.filter((candidate) => candidate !== uploadedItem),
									);
								}}
								previewHeight={previewHeight}
								urlLooksLikeImage={urlLooksLikeImage}
								urlLooksLikePdf={urlLooksLikePdf}
							/>
						))}
						{showAdd ? (
							<Button
								aria-label={
									typeof labels?.add === "string" ? labels.add : "Add file"
								}
								className={clsx(
									"aspect-video shrink-0 rounded-md! border border-dashed border-border!",
									isDragging &&
										"border-primary! bg-primary/5 text-primary-text",
								)}
								contentClassName="h-full w-full flex-col gap-2"
								disabled={disabled}
								onClick={() => inputRef.current?.click()}
								size="none"
								style={{ height: previewHeight }}
								type="button"
								variant="ghost"
							>
								<Icon name="plus" size="sm" />
								<span>{labels?.add ?? "Add file"}</span>
							</Button>
						) : null}
					</div>
				</fieldset>
			)}
		</Field>
	);
}

function FileInputSkeleton({
	className,
	count = 2,
	description,
	label = "Files",
	mode = "edit",
	previewHeight = 105,
}: Pick<
	FileInputProps,
	"className" | "description" | "label" | "mode" | "previewHeight"
> & { count?: number }) {
	return (
		<Field
			className={className}
			description={description}
			disableMessage
			label={label}
		>
			<div className="flex max-w-full gap-3 overflow-hidden">
				{Array.from({ length: count }, (_, index) => `file-${index + 1}`).map(
					(key) => (
						<FilePreview.Skeleton key={key} previewHeight={previewHeight} />
					),
				)}
				{mode === "edit" ? (
					<Skeleton
						className="aspect-video shrink-0 rounded-md"
						style={{ height: previewHeight }}
					/>
				) : null}
			</div>
		</Field>
	);
}

export const FileInput = Object.assign(FileInputRoot, {
	Skeleton: FileInputSkeleton,
});
