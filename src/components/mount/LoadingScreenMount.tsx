"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Logo from "@/components/branding/Logo";
import {
	hasIntroDisabledSearchParam,
	useIntroDisableOverride,
	useMotionDisableOverride,
} from "@/components/ui/foundations/motionDisableOverride";
import { getMotionTiming } from "@/components/ui/foundations/motionTiming";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import { markAppReady } from "@/lib/appReadySignal";
import { Text } from "../ui/primitives/Text";

type Phase = "loading" | "revealing" | "transitioning" | "done";

const REVEAL_DURATION_MS = Math.round(
	Number(getMotionTiming("grand").duration ?? 0) * 1000,
);
const FONT_READY_TIMEOUT_MS = 1_500;

function waitFor(duration: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, duration));
}

export default function LoadingScreenMount() {
	const immediateIntroDisabled = hasIntroDisabledSearchParam();
	const [phase, setPhase] = useState<Phase>(() =>
		hasIntroDisabledSearchParam() ? "done" : "loading",
	);
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const introOverrideDisabled = useIntroDisableOverride();
	const introDisabled =
		immediateIntroDisabled ||
		introOverrideDisabled ||
		motionDisabled ||
		!motionAllowed;

	useEffect(() => {
		if (!introDisabled) return;
		markAppReady();
		setPhase("done");
	}, [introDisabled]);

	useEffect(() => {
		if (!immediateIntroDisabled) return;

		document
			.querySelectorAll('[data-loading-screen-mount="true"]')
			.forEach((node) => {
				node.remove();
			});
	}, [immediateIntroDisabled]);

	// Prevent scroll until the loading screen is fully gone
	useEffect(() => {
		if (introDisabled || phase === "done") return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [introDisabled, phase]);

	useEffect(() => {
		if (introDisabled) return;
		let t1: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;
		Promise.all([
			// A missing or proxy-delayed font must not leave the whole page behind
			// the intro overlay. The animation itself is typography-independent.
			Promise.race([document.fonts.ready, waitFor(FONT_READY_TIMEOUT_MS)]),
			waitFor(500),
		]).then(() => {
			if (cancelled) return;
			setPhase("revealing");
			t1 = setTimeout(() => {
				if (cancelled) return;
				// Establish every deferred entrance before this overlay can expose it.
				markAppReady();
				setPhase("transitioning");
			}, REVEAL_DURATION_MS);
		});

		return () => {
			cancelled = true;
			clearTimeout(t1);
		};
	}, [introDisabled]);

	if (immediateIntroDisabled || introDisabled || phase === "done") return null;

	return (
		<motion.div
			aria-hidden="true"
			className={`fixed inset-0 flex items-center justify-center bg-background pointer-events-none ${
				phase === "transitioning" ? "z-40" : "z-[9999]"
			}`}
			data-loading-screen-mount="true"
			animate={{ opacity: phase === "transitioning" ? 0 : 1 }}
			transition={getMotionTiming("grand")}
			onAnimationComplete={() => {
				if (phase !== "transitioning") return;
				setPhase("done");
			}}
		>
			<motion.div
				className="flex items-stretch"
				transition={getMotionTiming("grand")}
			>
				<Logo as="span" variant="mark" size="lg" />
				<motion.div
					initial={{ maxWidth: 0 }}
					animate={{ maxWidth: phase === "loading" ? 0 : 420 }}
					className="overflow-hidden flex items-center"
					transition={getMotionTiming("grand")}
				>
					<div className="min-w-0.5 rounded-full bg-primary h-full mx-3" />
					<Text variant="heading2xxl" className="font-black!">
						AVERLO
					</Text>
				</motion.div>
			</motion.div>
		</motion.div>
	);
}
