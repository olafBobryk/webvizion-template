import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS, SOCIAL_LINKS } from "@/config/navConfig";
import Logo from "./Logo";

export default function Footer({
	className = "",
	navLinks = NAV_LINKS,
	socialLinks = SOCIAL_LINKS,
}: {
	className?: string;
	navLinks?: { name: string; link: string }[];
	socialLinks?: { image: string; href: string; name: string }[];
}) {
	return (
		<footer
			className={
				"flex flex-col items-center padding py-[100px] border-t border-white/[0.15] " +
				className
			}
		>
			<div className="flex flex-col justify-center items-center max relative overflow-hidden gap-[25px] ">
				<Logo size="md" />
				<div className="flex justify-center gap-y-[10px] flex-wrap items-center self-stretch flex-grow-0 flex-shrink-0 relative overflow-hidden gap-[45px] p-2.5">
					{navLinks.map((item) => (
						<Link
							href={item.link}
							key={item.name}
							type="button"
							className="flex-grow-0 flex-shrink-0 text-base text-left text-white/70 hover:text-white/90 transition-colors duration-300"
						>
							{item.name}
						</Link>
					))}
				</div>
				<div className="flex flex-wrap justify-center items-center flex-grow-0 flex-shrink-0 overflow-hidden gap-2.5">
					{socialLinks.map((item) => (
						<Link
							key={item.name}
							href={item.href}
							className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-[50px] h-[50px] relative overflow-hidden gap-2.5 rounded-[100px] bg-white/5 hover:bg-white/15 transition-colors duration-300 border border-white/5"
						>
							<Image
								src={item.image}
								alt={item.name}
								width={20}
								height={20}
								className="w-5 h-5"
							/>
						</Link>
					))}
				</div>
			</div>
		</footer>
	);
}
