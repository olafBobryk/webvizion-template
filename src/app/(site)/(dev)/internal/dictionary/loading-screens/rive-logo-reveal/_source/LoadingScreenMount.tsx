"use client";

import { motion } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { getMotionTiming } from "@/components/ui/foundations/motionTiming";
import { markAppReady } from "@/lib/appReadySignal";

export type LoadingScreenPhase =
	| "loading"
	| "revealing"
	| "transitioning"
	| "done";

const FONT_READY_TIMEOUT_MS = 2000;
const LOADING_FALLBACK_MS = 1500;
const REVEAL_GUARD_MS = 3000;
const EXIT_GUARD_MS = 1200;

const RiveLoadingAnimation = lazy(() =>
	import("./RiveLoadingAnimation").catch(() => ({
		default: (() =>
			null) as unknown as typeof import("./RiveLoadingAnimation")["default"],
	})),
);

export default function LoadingScreenMount() {
	const [phase, setPhase] = useState<LoadingScreenPhase>("loading");
	const [isAppReadyToReveal, setIsAppReadyToReveal] = useState(false);
	const [isLoadingComplete, setIsLoadingComplete] = useState(false);

	useEffect(() => {
		if (phase === "done") return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [phase]);

	useEffect(() => {
		Promise.race([
			document.fonts.ready,
			new Promise<void>((resolve) =>
				setTimeout(resolve, FONT_READY_TIMEOUT_MS),
			),
		]).then(() => {
			setIsAppReadyToReveal(true);
		});
	}, []);

	useEffect(() => {
		if (phase !== "loading" || isLoadingComplete) return;
		const id = setTimeout(() => {
			setIsLoadingComplete(true);
		}, LOADING_FALLBACK_MS);

		return () => clearTimeout(id);
	}, [isLoadingComplete, phase]);

	useEffect(() => {
		if (phase !== "loading") return;
		if (!isAppReadyToReveal || !isLoadingComplete) return;
		setPhase("revealing");
	}, [isAppReadyToReveal, isLoadingComplete, phase]);

	useEffect(() => {
		if (phase !== "revealing") return;
		const id = setTimeout(() => {
			setPhase((current) =>
				current === "revealing" ? "transitioning" : current,
			);
		}, REVEAL_GUARD_MS);

		return () => clearTimeout(id);
	}, [phase]);

	useEffect(() => {
		if (phase !== "transitioning") return;
		const id = setTimeout(() => {
			markAppReady();
			setPhase("done");
		}, EXIT_GUARD_MS);

		return () => clearTimeout(id);
	}, [phase]);

	if (phase === "done") return null;

	return (
		<motion.div
			aria-hidden="true"
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-background pointer-events-none"
			animate={{ opacity: phase === "transitioning" ? 0 : 1 }}
			transition={getMotionTiming("grand")}
			onAnimationComplete={() => {
				if (phase !== "transitioning") return;
				markAppReady();
				setPhase("done");
			}}
		>
			<Suspense fallback={null}>
				<RiveLoadingAnimation
					phase={phase}
					onLoadingComplete={() => setIsLoadingComplete(true)}
					onRevealComplete={() =>
						setPhase((current) =>
							current === "revealing" ? "transitioning" : current,
						)
					}
				/>
			</Suspense>
		</motion.div>
	);
}
