import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DevToolsShell } from "./_components/DevToolsShell";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default function DevOnlyInternalLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (process.env.NODE_ENV === "production") {
		notFound();
	}

	return <DevToolsShell>{children}</DevToolsShell>;
}
