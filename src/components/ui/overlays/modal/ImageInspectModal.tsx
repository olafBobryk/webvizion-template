"use client";

import Image from "next/image";
import * as React from "react";
import { Icon } from "@/components/ui/icons/Icon";
import { Loader } from "@/components/ui/misc/Loader";
import * as MotionEffect from "@/components/ui/motion/effect";
import * as MotionSource from "@/components/ui/motion/source";
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
	unoptimized?: boolean;
	onClose: () => void;
	shareUrl?: string;
	onShare?: () => void | Promise<void>;
};

export function ImageInspectModal({
	src,
	alt = "Preview image",
	unoptimized,
	onClose,
	shareUrl,
	onShare,
}: ImageInspectModalProps) {
	const [isSharing, setIsSharing] = React.useState(false);
	const [imageLoaded, setImageLoaded] = React.useState(false);
	const [imageFailed, setImageFailed] = React.useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset load state when the image source changes.
	React.useEffect(() => {
		setImageLoaded(false);
		setImageFailed(false);
	}, [src]);

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
					{!imageLoaded && !imageFailed ? (
						<div className="absolute inset-0 z-10 flex items-center justify-center">
							<Loader />
						</div>
					) : null}
					<MotionSource.Root
						className="h-full w-full"
						strategy={{ type: "reveal" }}
					>
						<MotionEffect.Clip className="h-full w-full">
							<MotionEffect.ScaleFade
								className="h-full w-full"
								fromOpacity={0.8}
								fromScale={1}
							>
								<Image
									src={src}
									alt={alt}
									fill
									sizes="(min-width: 1024px) 56rem, calc(100vw - 2rem)"
									priority
									unoptimized={unoptimized}
									className="object-contain select-none"
									onLoad={() => setImageLoaded(true)}
									onError={() => setImageFailed(true)}
								/>
							</MotionEffect.ScaleFade>
						</MotionEffect.Clip>
					</MotionSource.Root>
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
