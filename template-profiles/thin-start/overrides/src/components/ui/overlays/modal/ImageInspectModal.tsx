"use client";

import Image from "next/image";
import {
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { Button } from "@/components/ui/primitives/Button";

type ImageInspectModalProps = {
	alt?: string;
	onClose: () => void;
	onShare?: () => void | Promise<void>;
	shareUrl?: string;
	src: string;
	unoptimized?: boolean;
};

export function ImageInspectModal({
	src,
	alt = "Preview image",
	onClose,
	unoptimized,
}: ImageInspectModalProps) {
	return (
		<>
			<ModalHeader
				leadingIcon={
					<svg aria-hidden fill="none" viewBox="0 0 24 24">
						<title>Image</title>
						<path
							d="M4 6h3l1.5-2h7L17 6h3v14H4V6Z"
							stroke="currentColor"
							strokeWidth="1.5"
						/>
						<circle
							cx="12"
							cy="13"
							r="3"
							stroke="currentColor"
							strokeWidth="1.5"
						/>
					</svg>
				}
			>
				<ModalTitle>Image preview</ModalTitle>
			</ModalHeader>
			<ModalContent className="p-4">
				<div className="relative h-[min(70dvh,48rem)] overflow-hidden rounded-md bg-background">
					<Image
						alt={alt}
						className="object-contain"
						fill
						src={src}
						unoptimized={unoptimized}
					/>
				</div>
			</ModalContent>
			<ModalFooter>
				<Button onClick={onClose} type="button" variant="ghost">
					Close
				</Button>
			</ModalFooter>
		</>
	);
}
