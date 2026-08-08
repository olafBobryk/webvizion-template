"use client";

import clsx from "clsx";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import Logo from "@/components/branding/Logo";
import { instantTransition } from "@/components/ui/foundations/motionTiming";
import { spring } from "@/components/ui/foundations/spring";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/surfaces";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import {
	getHeaderSearchGroups,
	getMenuContentHeight,
	HEADER_MENU_CAPPED_COLUMNS,
	HEADER_MENU_DEFAULT_COLUMNS,
	HeaderMenuGrid,
	HeaderMenuIcon,
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
	className,
	link,
}: {
	className?: string;
	link: SiteLink;
}) {
	return (
		<Button
			href={getSiteLinkHref(link)}
			variant="ghost"
			size="none"
			className={clsx(
				"text-sm font-medium text-foreground/60 hover:text-foreground",
				className,
			)}
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
	const menuGroups = layout.menuGroups ?? [];
	const mobile = layout.mobile ?? {
		closeAriaLabel: "Close navigation",
		openAriaLabel: "Open navigation",
	};
	const search = layout.search ?? {
		ariaLabel: "Search pages",
		clearLabel: "Clear",
		noResultsText: "No matching pages",
	};
	const searchSourceGroups = layout.searchGroups ?? menuGroups;
	const topNavLinks = layout.topNavLinks ?? [];
	const isCompact = isScrolled && !isMenuOpen;
	const isSearchActive = searchQuery.trim().length > 0;
	const areTopNavLinksVisible = !isMenuOpen;
	const searchGroups = getHeaderSearchGroups(searchQuery, searchSourceGroups);
	const menuColumnCount = isCompact
		? HEADER_MENU_CAPPED_COLUMNS
		: HEADER_MENU_DEFAULT_COLUMNS;
	const activeMenuGroups = isSearchActive ? searchGroups : menuGroups;
	const menuContentHeight = getMenuContentHeight(
		activeMenuGroups,
		menuColumnCount,
	);
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
			ref={headerRef}
			initial={shouldAnimateEntrance ? HEADER_ENTRANCE_HIDDEN : false}
			animate={
				shouldAnimateEntrance
					? entranceReady
						? HEADER_ENTRANCE_VISIBLE
						: HEADER_ENTRANCE_HIDDEN
					: undefined
			}
			transition={headerTransition}
			className={clsx(
				"pointer-events-none fixed inset-x-0 top-0 z-50 overflow-hidden px-section-x",
				className,
			)}
		>
			<Panel
				aria-hidden="true"
				as={motion.div}
				background="page"
				border="none"
				className="pointer-events-none absolute inset-0 border-b border-border"
				data-shell-surface="marketing-header"
				display="block"
				gap="none"
				initial={false}
				animate={{ opacity: showHeaderSurface ? 1 : 0 }}
				overflow="visible"
				padding="none"
				radius="none"
				transition={headerTransition}
				width="full"
			/>
			<div className="relative mx-auto flex w-full max-w-section-max flex-col">
				<motion.div
					className="flex w-full items-center justify-between gap-6"
					initial={false}
					animate={{
						height: isCompact ? HEADER_COMPACT_HEIGHT : HEADER_EXPANDED_HEIGHT,
					}}
					transition={headerTransition}
				>
					<div className="flex min-w-[180px] items-center">
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
						className="pointer-events-auto flex items-center justify-center text-foreground"
						aria-label="Primary navigation"
					>
						<motion.div
							className="flex items-center justify-center gap-6 overflow-hidden py-2"
							initial={false}
							animate={{
								width: areTopNavLinksVisible ? "auto" : 0,
								opacity: areTopNavLinksVisible ? 1 : 0,
							}}
							transition={headerTransition}
							aria-hidden={!areTopNavLinksVisible}
						>
							{topNavLinks.map((item, index) => (
								<HeaderTopNavLink
									key={`${item.label}-${getSiteLinkHref(item)}`}
									link={item}
									className={
										index === topNavLinks.length - 1 ? "mr-6" : undefined
									}
								/>
							))}
						</motion.div>
						<HeaderSearchInput
							value={searchQuery}
							onValueChange={handleSearchQueryChange}
							onClear={closeMenu}
							ariaLabel={search.ariaLabel}
							clearLabel={search.clearLabel}
						/>
						<Button
							variant="ghost"
							className="min-h-10 px-3 text-foreground"
							aria-controls={menuId}
							aria-expanded={isMenuOpen}
							aria-label={
								isMenuOpen ? mobile.closeAriaLabel : mobile.openAriaLabel
							}
							onClick={toggleMenu}
							leadingIcon={
								<HeaderMenuIcon
									name={isMenuOpen ? "close" : "menu"}
									className="text-foreground"
								/>
							}
						/>
					</nav>
					<div className="pointer-events-auto flex min-w-[180px] justify-end">
						<Button href={getSiteLinkHref(layout.cta)} variant="primary">
							{layout.cta.label}
						</Button>
					</div>
				</motion.div>
				<AnimatePresence initial={false}>
					{isMenuOpen ? (
						<motion.div
							id={menuId}
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={menuTransition}
							className="pointer-events-auto overflow-hidden"
						>
							<div
								className="w-full border-t border-border"
								style={{
									paddingTop: HEADER_MENU_TOP_PADDING,
									paddingBottom: HEADER_MENU_BOTTOM_PADDING,
								}}
							>
								<motion.div
									className="relative overflow-hidden"
									initial={false}
									animate={{ height: menuContentHeight }}
									transition={menuTransition}
								>
									<div className="absolute inset-0">
										{isSearchActive ? (
											<HeaderSearchResults
												groups={searchGroups}
												onNavigate={closeMenu}
												columnCount={menuColumnCount}
												noResultsText={search.noResultsText}
											/>
										) : (
											<HeaderMenuGrid
												groups={menuGroups}
												onNavigate={closeMenu}
												columnCount={menuColumnCount}
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
