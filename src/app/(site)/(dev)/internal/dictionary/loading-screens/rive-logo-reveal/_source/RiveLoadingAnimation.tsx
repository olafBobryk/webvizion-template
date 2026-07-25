"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import Logo from "@/components/branding/Logo";
import { getMotionTiming } from "@/components/ui/foundations/motionTiming";
import { Text } from "@/components/ui/primitives/Text";
import type { LoadingScreenPhase } from "./LoadingScreenMount";

type RiveLoadingAnimationProps = {
	phase: LoadingScreenPhase;
	onLoadingComplete?: () => void;
	onRevealComplete?: () => void;
};

const LOADING_COMPLETE_MS = 450;
const REVEAL_COMPLETE_MS = 1100;

// Replace the internals of this adapter with the actual .riv asset and runtime
// when the template is ready to carry the dependency.
export default function RiveLoadingAnimation({
	phase,
	onLoadingComplete,
	onRevealComplete,
}: RiveLoadingAnimationProps) {
	useEffect(() => {
		const id = setTimeout(() => {
			onLoadingComplete?.();
		}, LOADING_COMPLETE_MS);

		return () => clearTimeout(id);
	}, [onLoadingComplete]);

	useEffect(() => {
		if (phase !== "revealing") return;
		const id = setTimeout(() => {
			onRevealComplete?.();
		}, REVEAL_COMPLETE_MS);

		return () => clearTimeout(id);
	}, [onRevealComplete, phase]);

	return (
		<div className="flex items-center gap-4">
			<motion.div
				animate={{
					scale: phase === "loading" ? 0.92 : 1,
					opacity: phase === "transitioning" ? 0.84 : 1,
				}}
				transition={getMotionTiming("grand")}
			>
				<Logo as="span" variant="mark" size="lg" />
			</motion.div>
			<motion.div
				className="flex items-center overflow-hidden"
				initial={false}
				animate={{
					maxWidth: phase === "loading" ? 0 : 320,
					opacity: phase === "transitioning" ? 0.7 : 1,
				}}
				transition={getMotionTiming("grand")}
			>
				<div className="mx-3 h-12 min-w-0.5 rounded-full bg-primary" />
				<Text as="span" variant="heading2xxl" className="font-black!">
					WEBVIZION
				</Text>
			</motion.div>
		</div>
	);
}
