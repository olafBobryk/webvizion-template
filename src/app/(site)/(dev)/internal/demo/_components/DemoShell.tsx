"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { focusRing } from "@/components/ui/foundations/focus";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Section } from "@/components/ui/primitives/Section";
import { getVisibleDemoPages } from "../content";

const NAV_PADDING_BASE = 12;

function buildPath(slug: string[]) {
	return `/internal/demo/${slug.join("/")}`;
}

export type DemoShellProps = {
	children: React.ReactNode;
};

export function DemoShell({ children }: DemoShellProps) {
	const pathname = usePathname();
	const visiblePages = getVisibleDemoPages();

	return (
		<Section
			padding="hero"
			innerClassName="flex w-full flex-col gap-8 lg:flex-row"
		>
			<aside className="w-full shrink-0 lg:w-64">
				<div className="lg:sticky lg:top-24">
					<Card size="sm">
						<Card.Header className="border-b">
							<Card.Title>Demo catalog</Card.Title>
							<Card.Action>
								<Button href="/internal/demo" size="sm" variant="secondary">
									Overview
								</Button>
							</Card.Action>
						</Card.Header>
						<Card.Content>
							<nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:flex lg:flex-col">
								{visiblePages.map((page) => {
									const href = buildPath(page.slug);
									const active = pathname === href;
									const paddingLeft =
										12 + (page.slug.length - 1) * NAV_PADDING_BASE;

									return (
										<Link
											aria-current={active ? "page" : undefined}
											aria-label={page.title}
											key={page.id}
											href={href}
											className={clsx(
												"relative flex h-9 min-w-0 items-center rounded-md text-sm font-medium transition-all motion-interactive",
												focusRing.visibleDefault,
												active
													? "bg-primary/10 text-primary"
													: "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
											)}
											style={{ paddingLeft, paddingRight: 12 }}
											title={page.title}
										>
											<span className="min-w-0 flex-1 truncate whitespace-nowrap">
												{page.title}
											</span>
										</Link>
									);
								})}
							</nav>
						</Card.Content>
					</Card>
				</div>
			</aside>
			<main className="min-w-0 flex-1">{children}</main>
		</Section>
	);
}
