"use client";

import clsx from "clsx";
import {
	createContext,
	type ElementType,
	type ReactNode,
	useContext,
	useInsertionEffect,
	useMemo,
} from "react";
import {
	getMotionCssVariables,
	type MotionMoment,
	type MotionResolveOptions,
	resolveMotionTransition,
} from "@/components/ui/foundations/motionTiming";
import { GlobalRevealScheduler } from "@/components/ui/motion/reveal/scheduler/GlobalRevealScheduler";

type MotionContextValue = {
	expressive: number;
};

type MotionProviderProps = {
	children: ReactNode;
	expressive?: number;
};

type MotionScopeProps = MotionProviderProps & {
	as?: ElementType;
	className?: string;
};

const MotionContext = createContext<MotionContextValue>({ expressive: 0 });

function resolveExpressive(parent: number, expressive = 0) {
	return Math.max(-1, Math.min(1, parent + expressive));
}

export function MotionProvider({
	children,
	expressive = 0,
}: MotionProviderProps) {
	const parent = useContext(MotionContext);
	const resolvedExpressive = resolveExpressive(parent.expressive, expressive);
	const variables = useMemo(
		() => getMotionCssVariables({ expressive: resolvedExpressive }),
		[resolvedExpressive],
	);
	const value = useMemo(
		() => ({ expressive: resolvedExpressive }),
		[resolvedExpressive],
	);

	useInsertionEffect(() => {
		const root = document.documentElement;
		const entries = Object.entries(variables);
		for (const [name, value] of entries) {
			root.style.setProperty(name, String(value));
		}

		return () => {
			for (const [name] of entries) {
				root.style.removeProperty(name);
			}
		};
	}, [variables]);

	return (
		<MotionContext.Provider value={value}>
			<GlobalRevealScheduler>{children}</GlobalRevealScheduler>
		</MotionContext.Provider>
	);
}

export function MotionScope({
	children,
	expressive = 0,
	as: Tag = "div",
	className,
}: MotionScopeProps) {
	const parent = useContext(MotionContext);
	const resolvedExpressive = resolveExpressive(parent.expressive, expressive);
	const value = useMemo(
		() => ({ expressive: resolvedExpressive }),
		[resolvedExpressive],
	);
	const style = useMemo(
		() => getMotionCssVariables({ expressive: resolvedExpressive }),
		[resolvedExpressive],
	);

	return (
		<MotionContext.Provider value={value}>
			<Tag className={clsx(className)} data-motion-scope="" style={style}>
				{children}
			</Tag>
		</MotionContext.Provider>
	);
}

export function useMotionTransition(
	moment: MotionMoment,
	options: MotionResolveOptions = {},
) {
	const { expressive } = useContext(MotionContext);
	return useMemo(
		() =>
			resolveMotionTransition(moment, {
				...options,
				expressive: expressive + (options.expressive ?? 0),
			}),
		[moment, options, expressive],
	);
}
