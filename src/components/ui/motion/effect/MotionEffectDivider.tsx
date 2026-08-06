"use client";

import clsx from "clsx";
import { motion, useTransform } from "motion/react";
import Divider from "@/components/ui/primitives/Divider";
import styles from "./MotionEffectDivider.module.css";
import { useMotionEffectProgress } from "./progress";

export type MotionEffectDividerProps = {
	className?: string;
	range?: readonly [number, number];
};

export function MotionEffectDivider({
	className,
	range = [0, 1],
}: MotionEffectDividerProps) {
	const { progress } = useMotionEffectProgress("Divider", range);
	const scaleX = useTransform(progress, [0, 1], [0.001, 1]);
	return (
		<motion.div
			className={clsx("w-full", styles.root, className)}
			data-motion-effect="divider"
			style={{ scaleX, willChange: "transform" }}
		>
			<Divider />
		</motion.div>
	);
}
