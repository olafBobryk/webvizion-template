"use client";

import * as React from "react";
import { Button } from "@/components/ui/primitives/Button";

export function Conversation({
	children,
	header,
}: {
	children: React.ReactNode;
	header?: React.ReactNode;
}) {
	const viewportRef = React.useRef<HTMLDivElement>(null);
	const [awayFromBottom, setAwayFromBottom] = React.useState(false);
	const scrollToBottom = React.useCallback(
		(behavior: ScrollBehavior = "smooth") => {
			viewportRef.current?.scrollTo({
				behavior,
				top: viewportRef.current.scrollHeight,
			});
		},
		[],
	);
	React.useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;
		if (!awayFromBottom) scrollToBottom("auto");
		const observer = new MutationObserver(() => {
			if (!awayFromBottom) scrollToBottom("auto");
		});
		observer.observe(viewport, {
			characterData: true,
			childList: true,
			subtree: true,
		});
		return () => observer.disconnect();
	}, [awayFromBottom, scrollToBottom]);
	return (
		<div className="relative min-h-0 flex-1">
			{header ? (
				<div className="absolute inset-x-0 top-0 z-10">{header}</div>
			) : null}
			<div
				className={
					header
						? "absolute inset-0 overflow-y-auto overscroll-contain pt-20 pb-6"
						: "absolute inset-0 overflow-y-auto overscroll-contain py-6"
				}
				onScroll={(event) => {
					const node = event.currentTarget;
					setAwayFromBottom(
						node.scrollHeight - node.scrollTop - node.clientHeight > 120,
					);
				}}
				ref={viewportRef}
			>
				<div className="grid gap-7 pb-8">{children}</div>
			</div>
			{awayFromBottom ? (
				<Button
					className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-md"
					onClick={() => scrollToBottom()}
					size="sm"
					variant="secondary"
				>
					Latest message
				</Button>
			) : null}
		</div>
	);
}
