"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMotionDisableOverride } from "@/components/ui/foundations/motionDisableOverride";
import { useAppReady } from "@/hooks/useAppReady";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import HeaderCompact from "./HeaderCompact";
import HeaderFull from "./HeaderFull";
import type { SiteLayoutDocument } from "./siteLayout";

const TOP_SCROLL_BAND_PX = 25;

type HeaderProps = {
	className?: string;
	forceScrolled?: boolean;
	forceScrolledPathPrefixes?: readonly string[];
	layout: SiteLayoutDocument["header"];
};

function getIsScrolled() {
	return window.scrollY > TOP_SCROLL_BAND_PX;
}

export default function Header({
	className = "",
	forceScrolled = false,
	forceScrolledPathPrefixes = [],
	layout,
}: HeaderProps) {
	const pathname = usePathname();
	const [isScrolled, setIsScrolled] = useState(false);
	const appReady = useAppReady();
	const motionAllowed = useMotionAllowed(true);
	const motionDisabled = useMotionDisableOverride();
	const isForceScrolledRoute = forceScrolledPathPrefixes.some((prefix) =>
		pathname.startsWith(prefix),
	);
	const effectiveIsScrolled =
		forceScrolled || isForceScrolledRoute || isScrolled;
	const shouldAnimate =
		motionAllowed && !motionDisabled && !forceScrolled && !isForceScrolledRoute;

	useEffect(() => {
		let frameId: number | null = null;
		let followUntil = 0;

		const measure = () => {
			setIsScrolled((current) => {
				const next = getIsScrolled();
				return current === next ? current : next;
			});
		};

		const scheduleMeasure = () => {
			if (frameId !== null) return;

			frameId = window.requestAnimationFrame(() => {
				frameId = null;
				measure();

				if (performance.now() < followUntil) {
					scheduleMeasure();
				}
			});
		};

		const handleScrollIntent = () => {
			followUntil = performance.now() + 700;
			scheduleMeasure();
		};

		measure();
		window.addEventListener("scroll", scheduleMeasure, { passive: true });
		document.addEventListener("scroll", scheduleMeasure, {
			capture: true,
			passive: true,
		});
		window.addEventListener("wheel", handleScrollIntent, { passive: true });
		window.addEventListener("touchmove", handleScrollIntent, { passive: true });
		window.addEventListener("touchend", handleScrollIntent, { passive: true });
		window.addEventListener("keydown", handleScrollIntent);
		window.addEventListener("hashchange", handleScrollIntent);
		document.addEventListener(
			"scrollcontroller:anchor-scroll",
			handleScrollIntent,
		);

		return () => {
			if (frameId !== null) {
				window.cancelAnimationFrame(frameId);
			}
			window.removeEventListener("scroll", scheduleMeasure);
			document.removeEventListener("scroll", scheduleMeasure, {
				capture: true,
			});
			window.removeEventListener("wheel", handleScrollIntent);
			window.removeEventListener("touchmove", handleScrollIntent);
			window.removeEventListener("touchend", handleScrollIntent);
			window.removeEventListener("keydown", handleScrollIntent);
			window.removeEventListener("hashchange", handleScrollIntent);
			document.removeEventListener(
				"scrollcontroller:anchor-scroll",
				handleScrollIntent,
			);
		};
	}, []);

	useEffect(() => {
		void pathname;
		const frameId = window.requestAnimationFrame(() => {
			setIsScrolled(getIsScrolled());
		});

		return () => {
			window.cancelAnimationFrame(frameId);
		};
	}, [pathname]);

	return (
		<>
			<div className="hidden lg:block">
				<HeaderFull
					animateEntrance={shouldAnimate}
					entranceReady={appReady}
					isScrolled={effectiveIsScrolled}
					layout={layout}
					className={className}
				/>
			</div>
			<div className="block lg:hidden">
				<HeaderCompact
					animateEntrance={shouldAnimate}
					entranceReady={appReady}
					isScrolled={effectiveIsScrolled}
					layout={layout}
					className={className}
				/>
			</div>
		</>
	);
}
