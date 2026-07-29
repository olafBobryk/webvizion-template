"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Loader } from "@/components/ui/misc/Loader";
import * as Reveal from "@/components/ui/motion/reveal";
import {
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { Button } from "@/components/ui/primitives/Button";
import { showToast } from "@/lib/feedback";

type ImageInspectModalProps = {
	src: string;
	alt?: string;
	onClose: () => void;
	shareUrl?: string;
	onShare?: () => void | Promise<void>;
};

export function ImageInspectModal({
	src,
	alt = "Preview image",
	onClose,
	shareUrl, //TODO: Figure out what needs to be on supabase for a share to happen
	onShare,
}: ImageInspectModalProps) {
	const [isSharing, setIsSharing] = React.useState(false);

	const handleShare = async () => {
		if (isSharing) return;
		setIsSharing(true);
		try {
			if (onShare) {
				await onShare();
				return;
			}

			const targetUrl = shareUrl ?? src;

			if (typeof navigator !== "undefined" && navigator.share && targetUrl) {
				await navigator.share({ url: targetUrl });
			} else {
				showToast.info("Sharing is not available on this device.");
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Unable to share this image.";
			showToast.error(message);
		} finally {
			setIsSharing(false);
		}
	};

	const canShowShare = Boolean(onShare || shareUrl);

	return (
		<>
			<ModalHeader leadingIcon={<Icon name="camera" size="sm" />}>
				<ModalTitle>Image preview</ModalTitle>
			</ModalHeader>
			<ModalContent className="p-4">
				<div className="relative h-[min(70dvh,48rem)] w-full overflow-hidden rounded-md bg-background">
					<Reveal.Image
						src={src}
						alt={alt}
						fill
						sizes="(min-width: 1024px) 56rem, calc(100vw - 2rem)"
						priority
						className="h-full w-full"
						contentClassName="h-full w-full"
						imageClassName="object-contain select-none"
						fallback={
							<div className="flex h-full w-full items-center justify-center">
								<Loader />
							</div>
						}
						fallbackClassName="flex items-center justify-center"
					/>
				</div>
			</ModalContent>
			<ModalFooter>
				<Button onClick={onClose} type="button" variant="ghost">
					Close
				</Button>
				{canShowShare ? (
					<Button
						disabled={isSharing}
						leadingIcon="camera"
						loading={isSharing}
						onClick={handleShare}
						type="button"
					>
						Share
					</Button>
				) : null}
			</ModalFooter>
		</>
	);
}
