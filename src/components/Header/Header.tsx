"use client";

import { useMediaQuery } from "react-responsive";
import { NAV_LINKS } from "../../config/navConfig";
import HeaderCompact from "./HeaderCompact";
import HeaderFull from "./HeaderFull";

// Header.tsx
export default function Header({
	className = "",
	navLinks = NAV_LINKS,
}: {
	className?: string;
	navLinks?: { name: string; link: string }[];
}) {
	const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });

	return isDesktop ? (
		<HeaderFull className={className} navLinks={navLinks} />
	) : (
		<HeaderCompact className={className} navLinks={navLinks} />
	);
}
