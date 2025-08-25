"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "../../config/navConfig";
import ButtonLink from "../ButtonLink";
import Logo from "../Logo";

export default function HeaderFull({
	className = "",
	navLinks = NAV_LINKS,
}: {
	className?: string;
	navLinks?: { name: string; link: string }[];
}) {
	const [atTop, setAtTop] = useState(false);
	const [hide, setHide] = useState(false);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentY = window.scrollY;
			setAtTop(currentY <= 50);

			if (currentY > lastScrollY && currentY > 10) {
				setHide(true); // scrolling down
			} else {
				setHide(false); // scrolling up
			}

			setLastScrollY(currentY);
		};

		window.addEventListener("scroll", handleScroll);

		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollY]);

	useEffect(() => {
		const currentY = window.scrollY;
		setAtTop(currentY <= 50);
	}, []);

	return (
		<header
			className={
				"h-[100px] fixed z-50 padding left-1/2 flex justify-center -translate-x-1/2 w-full group" +
				className
			}
			data-top={atTop}
			data-hide={hide}
		>
			<div className="max w-full flex items-center h-full">
				<div className="flex justify-between w-full">
					<Logo size="md" />
					<ButtonLink href="/contact">Join Now</ButtonLink>
				</div>
				<nav className="flex justify-start items-start backdrop-blur-lg overflow-hidden gap-[30px] px-5 py-[15px] rounded-[100px] bg-white/5 border border-white/[0.15] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 group-data-[hide=true]:-translate-y-[250%] transition-transform duration-300">
					{navLinks.map((item) => (
						<Link
							href={item.link}
							key={item.name}
							type="button"
							className="text-base text-left leading-[1em] text-white hover:text-white/80 duration-300 transition-colors"
						>
							{item.name}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
