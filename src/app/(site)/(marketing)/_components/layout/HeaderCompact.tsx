"use client";

import clsx from "clsx";
import { motion, type Transition } from "motion/react";
import { useState } from "react";
import Logo from "@/components/branding/Logo";
import { instantTransition } from "@/components/ui/foundations/motionTiming";
import { spring } from "@/components/ui/foundations/spring";
import { ScrollBorders } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import { getMarketingLinkHref } from "@/lib/marketing-content/links";
import type { SiteLayoutDocument } from "@/lib/marketing-content/types";
import {
	getHeaderSearchGroups,
	HeaderMenuGroup,
	HeaderMenuNoResults,
	HeaderSearchInput,
} from "./HeaderMenuContent";

const COMPACT_OPEN_TOP_PADDING = 16;
const COMPACT_OPEN_BAR_HEIGHT = 48;
const COMPACT_OPEN_MENU_GAP = 12;
const COMPACT_OPEN_MENU_OFFSET =
	COMPACT_OPEN_TOP_PADDING + COMPACT_OPEN_BAR_HEIGHT + COMPACT_OPEN_MENU_GAP;
const COMPACT_OPEN_CTA_HEIGHT = 60;
const COMPACT_OPEN_SCROLL_AREA_OFFSET =
	COMPACT_OPEN_MENU_OFFSET + COMPACT_OPEN_CTA_HEIGHT + 48;
const COMPACT_CLOSED_HEADER_HEIGHT = 76;
const COMPACT_CONDENSED_HEADER_HEIGHT = 60;
const HEADER_ENTRANCE_HIDDEN = { opacity: 0, y: -28, scale: 0.965 };
const HEADER_ENTRANCE_VISIBLE = { opacity: 1, y: 0, scale: 1 };

export default function HeaderCompact({
	animateEntrance = false,
	entranceReady = true,
	isScrolled,
	layout,
	className = "",
}: {
	animateEntrance?: boolean;
	entranceReady?: boolean;
	isScrolled: boolean;
	layout: SiteLayoutDocument["header"];
	className?: string;
}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const showHeaderSurface = isScrolled || isMenuOpen;
	const isCondensed = isScrolled && !isMenuOpen;
	const isSearchActive = searchQuery.trim().length > 0;
	const searchGroups = getHeaderSearchGroups(searchQuery, layout.searchGroups);
	const activeMenuGroups = isSearchActive ? searchGroups : layout.menuGroups;
	const motionAllowed = useMotionAllowed(true);
	const headerTransition: Transition = motionAllowed
		? spring.macro
		: instantTransition;
	const heightTransition: Transition = motionAllowed
		? spring.component
		: instantTransition;
	const shouldAnimateEntrance = animateEntrance && motionAllowed;
	const headerHeight = isMenuOpen
		? "100vh"
		: isCondensed
			? COMPACT_CONDENSED_HEADER_HEIGHT
			: COMPACT_CLOSED_HEADER_HEIGHT;
	const entranceState =
		shouldAnimateEntrance && !entranceReady
			? HEADER_ENTRANCE_HIDDEN
			: HEADER_ENTRANCE_VISIBLE;
	const closeMenu = () => {
		setSearchQuery("");
		setIsMenuOpen(false);
	};
	const toggleMenu = () => {
		if (isMenuOpen) {
			closeMenu();
			return;
		}

		setIsMenuOpen(true);
	};

	return (
		<motion.header
			data-site-header
			data-open={isMenuOpen}
			suppressHydrationWarning
			initial={
				shouldAnimateEntrance
					? { ...HEADER_ENTRANCE_HIDDEN, height: COMPACT_CLOSED_HEADER_HEIGHT }
					: false
			}
			animate={{
				height: headerHeight,
				...entranceState,
			}}
			transition={heightTransition}
			className={clsx("fixed inset-x-0 top-0 z-50 h-[76px]", className)}
		>
			<motion.div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 border-b border-border bg-background"
				initial={false}
				animate={{ opacity: showHeaderSurface ? 1 : 0 }}
				transition={headerTransition}
			/>
			<motion.div
				className="relative flex h-full w-full flex-col gap-3"
				initial={false}
			>
				<motion.div
					className="w-full px-section-x"
					initial={false}
					animate={{ paddingTop: isCondensed ? 8 : 16 }}
					transition={headerTransition}
				>
					<motion.div
						className="mx-auto flex w-full max-w-section-max items-center justify-between gap-3 px-3"
						initial={false}
						animate={{
							paddingTop: isCondensed ? 8 : 12,
							paddingBottom: isCondensed ? 8 : 12,
						}}
						transition={headerTransition}
					>
						<motion.div
							className="origin-left"
							initial={false}
							animate={{ scale: isCondensed ? 0.9 : 1 }}
							transition={headerTransition}
						>
							<Logo size="sm" className="pointer-events-auto" />
						</motion.div>
						<Button
							variant="ghost"
							size="sm"
							align="center"
							trailingIcon={isMenuOpen ? "minus" : "plus"}
							onClick={toggleMenu}
							aria-expanded={isMenuOpen}
							aria-label={
								isMenuOpen
									? layout.mobile.closeAriaLabel
									: layout.mobile.openAriaLabel
							}
						>
							{layout.mobile.menuLabel}
						</Button>
					</motion.div>
				</motion.div>
				<div className="w-full px-section-x">
					<div className="mx-auto w-full max-w-section-max">
						<div
							data-open={isMenuOpen}
							className="grid min-h-0 transition-[grid-template-rows,opacity] motion-component data-[open=false]:grid-rows-[0fr] data-[open=false]:opacity-0 data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100"
							style={{
								height: isMenuOpen
									? `calc(100vh - ${COMPACT_OPEN_MENU_OFFSET}px)`
									: undefined,
							}}
						>
							<div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
								<div className="shrink-0 pb-6">
									<HeaderSearchInput
										value={searchQuery}
										onValueChange={setSearchQuery}
										onClear={() => setSearchQuery("")}
										ariaLabel={layout.search.ariaLabel}
										clearLabel={layout.search.clearLabel}
										placeholder={layout.search.ariaLabel}
										className="group/header-search w-full text-sm text-foreground"
									/>
								</div>
								<div className="min-h-0 min-w-0 flex-1 overflow-hidden">
									<ScrollBorders
										showBackToTop={false}
										className="h-full w-full min-w-0 overflow-x-hidden overflow-y-auto"
										style={{
											maxHeight: `calc(100vh - ${COMPACT_OPEN_SCROLL_AREA_OFFSET}px)`,
										}}
									>
										<div className="flex min-h-full flex-col gap-3">
											{activeMenuGroups.length > 0 ? (
												<div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
													{activeMenuGroups.map((group) => (
														<div key={group.label} className="min-w-0">
															<HeaderMenuGroup
																group={group}
																onNavigate={closeMenu}
															/>
														</div>
													))}
												</div>
											) : (
												<HeaderMenuNoResults
													noResultsText={layout.search.noResultsText}
												/>
											)}
											<div className="mt-auto flex flex-col gap-8 pt-5">
												<Button
													variant="primary"
													href={getMarketingLinkHref(layout.cta)}
													onClick={closeMenu}
													className="w-full"
													contentClassName="justify-center"
												>
													{layout.cta.label}
												</Button>
											</div>
										</div>
									</ScrollBorders>
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.header>
	);
}
