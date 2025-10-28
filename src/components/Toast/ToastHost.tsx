"use client";

import {
	AnimatePresence,
	motion,
	type Transition,
	useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ToastType } from "@/lib/toast";
import Portal from "../Portal";

type ToastItem = {
	id: string;
	message: string;
	type: ToastType;
	endsAt: number;
};

const EVENT_NAME = "app-toast";

export default function ToastHost() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const prefersReduced = useReducedMotion();
	const timers = useRef<Record<string, number>>({});

	useEffect(() => {
		const handler = (e: Event) => {
			const {
				message,
				type = "info",
				durationMs = 3000,
			} = (e as CustomEvent).detail as {
				message: string;
				type?: ToastType;
				durationMs?: number;
			};

			const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
			const endsAt = Date.now() + durationMs;

			setToasts((prev) => [...prev, { id, message, type, endsAt }]);

			timers.current[id] = window.setTimeout(() => {
				setToasts((prev) => prev.filter((t) => t.id !== id));
				delete timers.current[id];
			}, durationMs + 30);
		};

		window.addEventListener(EVENT_NAME, handler as EventListener);
		return () =>
			window.removeEventListener(EVENT_NAME, handler as EventListener);
	}, []);

	// Safety cleanup if tab was backgrounded
	useEffect(() => {
		const i = window.setInterval(() => {
			const now = Date.now();
			setToasts((prev) => prev.filter((t) => t.endsAt > now));
		}, 1000);
		return () => window.clearInterval(i);
	}, []);

	return (
		<Portal>
			<div
				className="pointer-events-none fixed inset-x-0 bottom-4 z-[9999] mx-auto flex w-full max-w-sm flex-col items-center space-y-2 px-4
					[mask-image:linear-gradient(to_top,rgba(0,0,0,1)_0,rgba(0,0,0,1)_calc(46px*3+8px*3),rgba(0,0,0,0)_calc(46px*4+8px*3),rgba(0,0,0,0)_100%)]
					[mask-repeat:no-repeat]
					[mask-size:100%_100%]
					[-webkit-mask-image:linear-gradient(to_top,rgba(0,0,0,1)_0,rgba(0,0,0,1)_calc(46px*3+8px*3),rgba(0,0,0,0)_calc(46px*4+8px*3),rgba(0,0,0,0)_100%)]
					[-webkit-mask-repeat:no-repeat]
					[-webkit-mask-size:100%_100%]
				"
			>
				<AnimatePresence initial={false}>
					{toasts.map((t) => (
						<Toast
							key={t.id}
							id={t.id}
							message={t.message}
							type={t.type}
							onClose={() => {
								// allow manual close if you add a button later
								clearTimeout(timers.current[t.id]);
								setToasts((prev) => prev.filter((x) => x.id !== t.id));
								delete timers.current[t.id];
							}}
							prefersReduced={prefersReduced === null ? false : prefersReduced}
						/>
					))}
				</AnimatePresence>
			</div>
		</Portal>
	);
}

function Toast({
	id,
	message,
	type,
	onClose,
	prefersReduced,
}: {
	id: string;
	message: string;
	type: ToastType;
	onClose: () => void;
	prefersReduced: boolean;
}) {
	const palette =
		type === "success"
			? "bg-[#22C55E]/80 border-[#22C55E]/30 text-white"
			: type === "error"
				? "bg-[#EF4444]/80 border-[#EF4444]/30 text-white "
				: "bg-slate-800 text-white";

	// Animations
	const transition: Transition = prefersReduced
		? { duration: 0 }
		: { type: "spring", stiffness: 500, damping: 40, mass: 0.8 };

	return (
		<motion.div
			aria-live="polite"
			layout // this makes items push each other smoothly
			initial={{ opacity: 0, y: 12, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 12, scale: 0.98 }}
			transition={transition}
			className={[
				"pointer-events-auto w-full rounded-xl border-1 border-solid px-4 py-3 shadow-xl ring-1 ring-black/5",
				"focus:outline-none focus:ring-2 focus:ring-white/40",
				palette,
			].join(" ")}
		>
			<div className="text-sm">{message}</div>
		</motion.div>
	);
}
