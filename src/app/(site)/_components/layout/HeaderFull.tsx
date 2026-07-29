"use client";

import clsx from "clsx";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
import Logo from "@/components/branding/Logo";
import { instantTransition } from "@/components/ui/foundations/motionTiming";
import { spring } from "@/components/ui/foundations/spring";
import { IconSwap } from "@/components/ui/helpers/IconSwap";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import {
	getHeaderSearchGroups,
	getMenuContentHeight,
	HEADER_MENU_CAPPED_COLUMNS,
	HEADER_MENU_DEFAULT_COLUMNS,
	HeaderMenuGrid,
	HeaderSearchInput,
	HeaderSearchResults,
} from "./HeaderMenuContent";
import type { SiteLayoutDocument, SiteLink } from "./siteLayout";
import { getSiteLinkHref } from "./siteLayout";

const HEADER_EXPANDED_HEIGHT = 100;
const HEADER_COMPACT_HEIGHT = 70;
const HEADER_MENU_TOP_PADDING = 22;
const HEADER_MENU_BOTTOM_PADDING = 32;
const HEADER_ENTRANCE_HIDDEN = { opacity: 0, y: -28, scale: 0.965 };
const HEADER_ENTRANCE_VISIBLE = { opacity: 1, y: 0, scale: 1 };

function HeaderTopNavLink({
	link,
	focusable,
	className,
}: {
	link: SiteLink;
	focusable: boolean;
	className?: string;
}) {
	return (
		<Button
			href={getSiteLinkHref(link)}
			variant="ghost"
			size="md"
			textVariant="nav"
			textTone="inherit"
			className={clsx(
				"text-foreground/50 hover:!text-foreground/50 active:!text-foreground/50",
				className,
			)}
			focusable={focusable}
		>
			{link.label}
		</Button>
	);
}

export default function HeaderFull({
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
	const headerRef = useRef<HTMLElement>(null);
	const menuId = useId();
	const isCompact = isScrolled && !isMenuOpen;
	const isSearchActive = searchQuery.trim().length > 0;
	const areTopNavLinksVisible = !isMenuOpen;
	const searchGroups = getHeaderSearchGroups(searchQuery, layout.searchGroups);
	const activeMenuGroups = isSearchActive ? searchGroups : layout.menuGroups;
	const menuContentHeightStyle = {
		"--header-menu-content-height-lg": `${getMenuContentHeight(
			activeMenuGroups,
			HEADER_MENU_CAPPED_COLUMNS,
		)}px`,
		"--header-menu-content-height-xl": `${getMenuContentHeight(
			activeMenuGroups,
			HEADER_MENU_DEFAULT_COLUMNS,
		)}px`,
	} as CSSProperties;
	const showHeaderSurface = isScrolled || isMenuOpen;
	const motionAllowed = useMotionAllowed(true);
	const headerTransition: Transition = motionAllowed
		? spring.macro
		: instantTransition;
	const menuTransition: Transition = motionAllowed
		? spring.component
		: instantTransition;
	const shouldAnimateEntrance = animateEntrance && motionAllowed;

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

	const handleSearchQueryChange = (value: string) => {
		setSearchQuery(value);

		if (value.trim().length > 0) {
			setIsMenuOpen(true);
		}
	};

	useEffect(() => {
		if (!isMenuOpen) return;

		function handlePointerDown(event: PointerEvent) {
			const target = event.target;

			if (!(target instanceof Node)) return;
			if (headerRef.current?.contains(target)) return;

			setSearchQuery("");
			setIsMenuOpen(false);
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [isMenuOpen]);

	return (
		<motion.header
			data-site-header
			suppressHydrationWarning
			ref={headerRef}
			initial={shouldAnimateEntrance ? HEADER_ENTRANCE_HIDDEN : false}
			animate={
				shouldAnimateEntrance
					? entranceReady
						? HEADER_ENTRANCE_VISIBLE
						: HEADER_ENTRANCE_HIDDEN
					: HEADER_ENTRANCE_VISIBLE
			}
			transition={headerTransition}
			className={clsx(
				"pointer-events-none fixed inset-x-0 top-0 z-50",
				className,
			)}
		>
			<motion.div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 border-b border-border bg-background"
				initial={false}
				animate={{ opacity: showHeaderSurface ? 1 : 0 }}
				transition={headerTransition}
			/>
			<div className="relative flex w-full flex-col">
				<div className="relative w-full px-section-x">
					<motion.div
						className="relative mx-auto flex w-full max-w-section-max items-center justify-between gap-6"
						initial={false}
						animate={{
							height: isCompact
								? HEADER_COMPACT_HEIGHT
								: HEADER_EXPANDED_HEIGHT,
						}}
						transition={headerTransition}
					>
						<div className="flex min-w-[220px] items-center">
							<motion.div
								className="origin-left"
								initial={false}
								animate={{ scale: isCompact ? 0.88 : 1 }}
								transition={headerTransition}
							>
								<Logo size="md" className="pointer-events-auto" />
							</motion.div>
						</div>
						<nav
							className="pointer-events-auto relative flex items-center justify-center text-foreground"
							aria-label="Primary navigation"
						>
							<motion.div
								className="hidden items-center justify-center gap-10 overflow-hidden py-2 xl:flex"
								initial={false}
								animate={{
									width: areTopNavLinksVisible ? "auto" : 0,
									opacity: areTopNavLinksVisible ? 1 : 0,
								}}
								transition={headerTransition}
								aria-hidden={!areTopNavLinksVisible}
							>
								{layout.topNavLinks.map((item, index) => (
									<HeaderTopNavLink
										key={`${item.label}-${getSiteLinkHref(item)}`}
										link={item}
										focusable={areTopNavLinksVisible}
										className={
											index === layout.topNavLinks.length - 1
												? "mr-10"
												: undefined
										}
									/>
								))}
							</motion.div>
							<HeaderSearchInput
								value={searchQuery}
								onValueChange={handleSearchQueryChange}
								onClear={closeMenu}
								ariaLabel={layout.search.ariaLabel}
								clearLabel={layout.search.clearLabel}
							/>
							<Button
								variant="ghost"
								size="icon"
								textTone="inherit"
								className="text-foreground hover:!text-foreground active:!text-foreground"
								aria-controls={menuId}
								aria-expanded={isMenuOpen}
								aria-label={
									isMenuOpen
										? layout.mobile.closeAriaLabel
										: layout.mobile.openAriaLabel
								}
								onClick={toggleMenu}
								leadingIcon={
									<IconSwap
										activeIndex={isMenuOpen ? 1 : 0}
										size="lg"
										items={[
											{
												icon: (
													<Icon
														name="menu"
														className="size-full text-foreground"
														style={{ width: "100%", height: "100%" }}
													/>
												),
											},
											{
												icon: (
													<Icon
														name="close"
														className="size-full text-foreground"
														style={{ width: "100%", height: "100%" }}
													/>
												),
											},
										]}
									/>
								}
							/>
						</nav>
						<div className="pointer-events-auto flex min-w-[220px] justify-end">
							<Button
								href={getSiteLinkHref(layout.cta)}
								variant="primary"
								size="md"
							>
								{layout.cta.label}
							</Button>
						</div>
					</motion.div>
				</div>
				<AnimatePresence initial={false}>
					{isMenuOpen ? (
						<motion.div
							id={menuId}
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={menuTransition}
							className="pointer-events-auto relative w-full overflow-hidden px-section-x"
						>
							<div
								className="mx-auto w-full max-w-section-max border-t border-border"
								style={{
									paddingTop: HEADER_MENU_TOP_PADDING,
									paddingBottom: HEADER_MENU_BOTTOM_PADDING,
								}}
							>
								<motion.div
									className="relative [--header-menu-content-height:var(--header-menu-content-height-lg)] xl:[--header-menu-content-height:var(--header-menu-content-height-xl)]"
									initial={false}
									animate={{ height: "var(--header-menu-content-height)" }}
									style={menuContentHeightStyle}
									transition={menuTransition}
								>
									<div className="absolute inset-0">
										{isSearchActive ? (
											<HeaderSearchResults
												className="lg:grid-cols-5 xl:grid-cols-6"
												groups={searchGroups}
												onNavigate={closeMenu}
												columnCount={HEADER_MENU_DEFAULT_COLUMNS}
												noResultsText={layout.search.noResultsText}
											/>
										) : (
											<HeaderMenuGrid
												className="lg:grid-cols-5 xl:grid-cols-6"
												groups={layout.menuGroups}
												onNavigate={closeMenu}
												columnCount={HEADER_MENU_DEFAULT_COLUMNS}
											/>
										)}
									</div>
								</motion.div>
							</div>
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
		</motion.header>
	);
}
