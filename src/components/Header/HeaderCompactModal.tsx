import Image from "next/image";
import Link from "next/link";
import { NAV_LINKS } from "../../config/navConfig";
import Portal from "../Portal";

export default function HeaderCompactModal({
	navLinks = NAV_LINKS,
	isModalOpen = false,
	handleChangeModal,
}: {
	navLinks?: { name: string; link: string }[];
	isModalOpen: boolean;
	handleChangeModal: () => void;
}) {
	return (
		<Portal>
			<div
				data-open={isModalOpen}
				className="w-full pt-[150px] h-screen padding duration-300 overflow-hidden transition-[opacity] bg-white fixed top-0 z-40 pointer-events-none data-[open=true]:pointer-events-auto opacity-0 data-[open=true]:opacity-100"
			>
				<nav className="flex flex-col overflow-auto h-full border-t border-[#111416]/[0.15]">
					{navLinks.map((obj) => (
						<Link
							href={obj.link}
							key={obj.name}
							onClick={handleChangeModal}
							className="group"
						>
							<div className="flex justify-start items-center self-stretch flex-grow-0 flex-shrink-0 relative overflow-hidden gap-2.5 px-2.5 py-[25px] border-[#111416]/[0.15] border-b">
								<p className="flex-grow-0 flex-shrink-0 text-xl font-medium text-left capitalize text-[#111416]">
									{obj.name}
								</p>
								<div className="self-stretch flex-grow w-[249px] h-[27px] relative overflow-hidden" />
								<Image
									src="/components/header/arrow.svg"
									alt="alt"
									width={25}
									height={25}
									className="flex-grow-0 flex-shrink-0 w-[25px] h-[25px] relative"
								/>
							</div>
						</Link>
					))}
				</nav>
			</div>
		</Portal>
	);
}
