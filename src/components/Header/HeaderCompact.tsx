"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "../../config/navConfig";
import Logo from "../Logo";
import HeaderCompactModal from "./HeaderCompactModal";

export default function HeaderCompact({
	className = "",
	navLinks = NAV_LINKS,
}: {
	className?: string;
	navLinks?: { name: string; link: string }[];
}) {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const handleChangeModal = () => {
		setIsModalOpen(!isModalOpen);
	};

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
			data-open={isModalOpen}
			data-top={atTop}
			data-hide={hide}
			className="group fixed w-full z-50 transition-all duration-300"
		>
			<div className=" relative w-screen padding group-data-[open=true]:fixed">
				<div
					className={
						"w-full h-[100px] items-center relative justify-between overflow-hidden z-[100] flex " +
						className
					}
				>
					<Logo />
					<div className="flex gap-[6px]">
						<button
							type="button"
							onClick={handleChangeModal}
							className="flex flex-col justify-start items-start relative overflow-hidden gap-2.5 px-[20px] py-[15px] rounded-[100px] bg-white/[0.15] group-data-[open=false]:group-data-[light=true]:bg-[rgba(17,20,22,0.15)]"
							style={{
								boxShadow: !isModalOpen
									? "2px 4px 15px -2px rgba(17,20,22,0.05)"
									: "",
							}}
						>
							<Image
								src="/components/header/menu.svg"
								alt="menu"
								width={19}
								height={19}
								className="group-data-[open=true]:opacity-0 group-data-[open=true]:rotate-90 duration-300 transition-all text-white group-data-[light=true]:text-[#111416]"
							/>
							<Image
								src="/components/header/close.svg"
								alt="close"
								width={25}
								height={25}
								className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-data-[open=true]:opacity-100 -rotate-90 group-data-[open=true]:rotate-0 opacity-0 duration-300 transition-all"
							/>
						</button>
					</div>
				</div>
			</div>
			<HeaderCompactModal
				isModalOpen={isModalOpen}
				handleChangeModal={handleChangeModal}
				navLinks={navLinks}
			/>
		</header>
	);
}
