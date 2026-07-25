import type { ReactNode } from "react";
import { DemoShell } from "./_components/DemoShell";

export default function DemoLayout({ children }: { children: ReactNode }) {
	return <DemoShell>{children}</DemoShell>;
}
