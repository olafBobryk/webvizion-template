import type * as React from "react";
import { MessageFrame } from "../message/frame";

export function StatusFrame({ children }: { children: React.ReactNode }) {
	return (
		<MessageFrame ariaLabel="Assistant">
			<div
				aria-live="polite"
				className="flex min-h-[1.4375rem] max-w-2xl items-center"
				role="status"
			>
				{children}
			</div>
		</MessageFrame>
	);
}
