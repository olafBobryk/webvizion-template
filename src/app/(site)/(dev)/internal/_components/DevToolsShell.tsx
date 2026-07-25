import type { ReactNode } from "react";
import { Text } from "@/components/ui/primitives/Text";

export function DevToolsShell({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<div className="border-b bg-panel/80 px-4 py-2 backdrop-blur-sm">
				<Text as="p" variant="caption" tone="muted">
					Local developer surface
				</Text>
			</div>
			{children}
		</div>
	);
}
