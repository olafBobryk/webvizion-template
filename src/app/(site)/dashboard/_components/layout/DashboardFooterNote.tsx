import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "@/components/ui/foundations/focus";
import { Text } from "@/components/ui/primitives/Text";
import { hrefFor } from "@/lib/routes";

type DashboardFooterNoteProps = {
	children?: ReactNode;
	className?: string;
};

type DashboardFooterNoteLinkProps = {
	children: ReactNode;
	href: string;
};

const footerNoteLinkClassName = clsx(
	"font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground",
	focusRing.visibleDefault,
);

function DashboardFooterNoteRoot({
	children,
	className,
}: DashboardFooterNoteProps) {
	return (
		<Text
			as="p"
			className={clsx("w-full leading-5", className)}
			tone="muted"
			variant="caption"
		>
			Looking for something specific and cannot find it?{" "}
			<DashboardFooterNoteLink href={hrefFor("dashboard.support")}>
				Contact support
			</DashboardFooterNoteLink>
			. {children}
		</Text>
	);
}

export const DashboardFooterNote = DashboardFooterNoteRoot;

export function DashboardFooterNoteLink({
	children,
	href,
}: DashboardFooterNoteLinkProps) {
	return (
		<Link className={footerNoteLinkClassName} href={href}>
			{children}
		</Link>
	);
}
