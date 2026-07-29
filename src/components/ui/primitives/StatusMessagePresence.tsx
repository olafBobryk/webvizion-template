"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { useMotionTransition } from "@/components/ui/foundations/MotionProvider";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import {
	type StatusMessageProps,
	StatusMessageSurface,
} from "./StatusMessageSurface";

export type StatusMessagePresenceGap = "none" | "sm" | "md";

export type StatusMessagePresenceProps = StatusMessageProps & {
	gap?: StatusMessagePresenceGap;
	open: boolean;
};

const presenceGap = {
	none: "0rem",
	sm: "0.75rem",
	md: "1rem",
} as const satisfies Record<StatusMessagePresenceGap, string>;

export function StatusMessagePresence({
	gap = "sm",
	open,
	...messageProps
}: StatusMessagePresenceProps) {
	const motionSettingAllowed = useMotionAllowed(true);
	const motionDisabledByUrl = useMotionDisableOverride();
	const motionAllowed = motionSettingAllowed && !motionDisabledByUrl;
	const transition = useMotionTransition("disclosure", {
		intensity: "subtle",
		surface: "flat",
	});
	const [overflowVisible, setOverflowVisible] = React.useState(open);

	React.useEffect(() => {
		if (!open || !motionAllowed) setOverflowVisible(open);
	}, [motionAllowed, open]);

	if (!motionAllowed) {
		return (
			<div
				data-open={open || undefined}
				data-slot="status-message-presence"
				style={{ paddingTop: open ? presenceGap[gap] : 0 }}
			>
				{open ? <StatusMessageSurface {...messageProps} /> : null}
			</div>
		);
	}

	return (
		<motion.div
			animate={{
				height: open ? "auto" : 0,
				paddingTop: open ? presenceGap[gap] : "0rem",
			}}
			aria-hidden={!open || undefined}
			data-open={open || undefined}
			data-slot="status-message-presence"
			initial={false}
			inert={!open || undefined}
			onAnimationComplete={() => {
				if (open) setOverflowVisible(true);
			}}
			onAnimationStart={() => setOverflowVisible(false)}
			style={{ overflow: overflowVisible ? "visible" : "hidden" }}
			transition={transition}
		>
			<AnimatePresence initial={false}>
				{open ? (
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.98 }}
						initial={{ opacity: 0, scale: 0.98 }}
						style={{ transformOrigin: "top center" }}
						transition={transition}
					>
						<StatusMessageSurface {...messageProps} />
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}
