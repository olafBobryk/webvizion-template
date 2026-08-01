import clsx from "clsx";
import { Card, type CardProps } from "@/components/ui/primitives/surfaces";

export type ModalCardMaxWidth = "md" | "lg" | "xl" | "2xl" | "4xl";

const maxWidthClassNames: Record<ModalCardMaxWidth, string> = {
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
	"2xl": "max-w-2xl",
	"4xl": "max-w-4xl",
};

export type ModalCardProps = CardProps & {
	maxWidth?: ModalCardMaxWidth;
};

export function ModalCard({
	className,
	maxWidth = "lg",
	...props
}: ModalCardProps) {
	return (
		<Card
			className={clsx(
				"relative max-h-[inherit] w-full min-w-0 text-sm",
				maxWidthClassNames[maxWidth],
				className,
			)}
			display="flex"
			gap="none"
			elevation="overlay"
			overflow="hidden"
			padding="none"
			{...props}
		/>
	);
}
