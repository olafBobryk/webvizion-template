"use client";

import { useMediaQuery } from "react-responsive";

/**
 * Tailwind default breakpoints:
 * sm: 640px
 * md: 768px
 * lg: 1024px
 * xl: 1280px
 * 2xl: 1536px
 *
 * Note: These booleans are computed on the client.
 * Import and call this hook inside client components.
 */
export function useTailwindBreakpoints() {
	// "Only" ranges (non-overlapping)
	const isXs = useMediaQuery({ maxWidth: 639.98 }); // < 640
	const isSm = useMediaQuery({ minWidth: 640, maxWidth: 767.98 });
	const isMd = useMediaQuery({ minWidth: 768, maxWidth: 1023.98 });
	const isLg = useMediaQuery({ minWidth: 1024, maxWidth: 1279.98 });
	const isXl = useMediaQuery({ minWidth: 1280, maxWidth: 1535.98 });
	const is2xl = useMediaQuery({ minWidth: 1536 });

	// "Up" helpers (inclusive)
	const isSmUp = useMediaQuery({ minWidth: 640 });
	const isMdUp = useMediaQuery({ minWidth: 768 });
	const isLgUp = useMediaQuery({ minWidth: 1024 });
	const isXlUp = useMediaQuery({ minWidth: 1280 });
	const is2xlUp = useMediaQuery({ minWidth: 1536 });

	// "Down" helpers (inclusive)
	const isSmDown = useMediaQuery({ maxWidth: 639.98 });
	const isMdDown = useMediaQuery({ maxWidth: 767.98 });
	const isLgDown = useMediaQuery({ maxWidth: 1023.98 });
	const isXlDown = useMediaQuery({ maxWidth: 1279.98 });
	const is2xlDown = useMediaQuery({ maxWidth: 1535.98 });

	return {
		// only
		isXs,
		isSm,
		isMd,
		isLg,
		isXl,
		is2xl,

		// up
		isSmUp,
		isMdUp,
		isLgUp,
		isXlUp,
		is2xlUp,

		// down
		isSmDown,
		isMdDown,
		isLgDown,
		isXlDown,
		is2xlDown,
	};
}

/**
 * Convenience single-breakpoint hooks if you prefer importing just one.
 * Example:
 *   const isMd = useIsMd();
 */
export const useIsXs = () => useTailwindBreakpoints().isXs;
export const useIsSm = () => useTailwindBreakpoints().isSm;
export const useIsMd = () => useTailwindBreakpoints().isMd;
export const useIsLg = () => useTailwindBreakpoints().isLg;
export const useIsXl = () => useTailwindBreakpoints().isXl;
export const useIs2xl = () => useTailwindBreakpoints().is2xl;

// Up variants
export const useIsSmUp = () => useTailwindBreakpoints().isSmUp;
export const useIsMdUp = () => useTailwindBreakpoints().isMdUp;
export const useIsLgUp = () => useTailwindBreakpoints().isLgUp;
export const useIsXlUp = () => useTailwindBreakpoints().isXlUp;
export const useIs2xlUp = () => useTailwindBreakpoints().is2xlUp;

// Down variants
export const useIsSmDown = () => useTailwindBreakpoints().isSmDown;
export const useIsMdDown = () => useTailwindBreakpoints().isMdDown;
export const useIsLgDown = () => useTailwindBreakpoints().isLgDown;
export const useIsXlDown = () => useTailwindBreakpoints().isXlDown;
export const useIs2xlDown = () => useTailwindBreakpoints().is2xlDown;
