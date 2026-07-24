import { Button } from "@/components/ui/primitives/Button";

type OverviewLink = {
	href: string;
	label: string;
};

export function OverviewLinks({ links }: { links: OverviewLink[] }) {
	return (
		<div className="flex flex-wrap gap-2">
			{links.map((link) => (
				<Button key={link.href} href={link.href} size="sm" variant="secondary">
					{link.label}
				</Button>
			))}
		</div>
	);
}
