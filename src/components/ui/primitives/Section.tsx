// components/ui/primitives/Section.tsx
import { cva, type VariantProps } from "class-variance-authority";
import {
	Children,
	type ComponentPropsWithoutRef,
	type ElementType,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";

const outerStyles = cva("w-full", {
	variants: {
		padding: {
			none: "",
			soft: "px-[calc(var(--spacing-section-x)/2)] py-[calc(var(--spacing-section-y)/2)]",
			default: "px-[var(--spacing-section-x)] py-[var(--spacing-section-y)]",
			"flush-x": "py-[var(--spacing-section-y)]",
			hero: "px-[var(--spacing-section-x)] pb-[var(--spacing-section-y)] pt-[calc(var(--site-header-height)+var(--spacing-section-y))]",
		},
		background: {
			none: "",
			surface: "bg-surface",
			background: "bg-background",
			foreground: "bg-foreground",
			ink: "bg-ink text-ink-foreground",
			paper: "bg-paper text-paper-foreground",
			primary: "bg-primary text-primary-foreground",
		},
		height: {
			auto: "h-auto",
			hero: "flex min-h-[min(100svh,1000px)] flex-col",
		},
	},
	defaultVariants: {
		padding: "default",
		background: "none",
	},
});

const innerStyles = cva("w-full flex flex-col", {
	variants: {
		maxWidth: {
			default: "max-w-section-max mx-auto",
			wide: "max-w-none",
			narrow: "max-w-4xl mx-auto",
			none: "",
		},
		align: {
			start: "items-start",
			center: "items-center text-center",
			end: "items-end",
		},
		justify: {
			start: "justify-start",
			center: "[justify-content:safe_center]",
			end: "justify-end",
		},
		size: {
			seamless: "min-h-full h-fit",
		},
	},
	defaultVariants: {
		maxWidth: "default",
		align: "start",
		justify: "start",
		size: "seamless",
	},
});

export type SectionBackgroundProps = {
	children: ReactNode;
	className?: string;
	interactive?: boolean;
};

type SectionProps<T extends ElementType> = {
	as?: T;
	children: ReactNode;
	className?: string;
	innerClassName?: string;
} & VariantProps<typeof outerStyles> &
	VariantProps<typeof innerStyles> &
	Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

function SectionBackground({ children }: SectionBackgroundProps) {
	return <>{children}</>;
}

SectionBackground.displayName = "Section.Background";

function isSectionBackgroundElement(
	child: ReactNode,
): child is ReactElement<SectionBackgroundProps, typeof SectionBackground> {
	return isValidElement(child) && child.type === SectionBackground;
}

function SectionRoot<T extends ElementType = "section">({
	as,
	children,
	className,
	innerClassName,
	padding,
	background,
	height,
	maxWidth,
	align,
	justify,
	size,
	...rest
}: SectionProps<T>) {
	const Tag = (as ?? "section") as ElementType;
	const backgroundChildren: ReactElement<
		SectionBackgroundProps,
		typeof SectionBackground
	>[] = [];
	const foregroundChildren: ReactNode[] = [];

	Children.forEach(children, (child) => {
		if (isSectionBackgroundElement(child)) {
			backgroundChildren.push(child);
			return;
		}

		foregroundChildren.push(child);
	});

	const hasBackground = backgroundChildren.length > 0;

	const outerClass = [
		outerStyles({ padding, background, height }),
		hasBackground ? "relative isolate overflow-hidden" : undefined,
		className,
	]
		.filter(Boolean)
		.join(" ");
	const innerClass = [
		innerStyles({ maxWidth, align, justify, size }),
		height === "hero" ? "flex-1" : undefined,
		hasBackground ? "relative z-10" : undefined,
		innerClassName,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<Tag
			className={outerClass}
			data-section-root=""
			data-surface-context={background ?? undefined}
			{...(rest as ComponentPropsWithoutRef<ElementType>)}
		>
			{hasBackground ? (
				<div className="absolute inset-0 z-0">
					{backgroundChildren.map((child, index) => (
						<div
							key={child.key ?? `section-background-${index}`}
							className={[
								"absolute inset-0 h-full w-full",
								child.props.interactive ? undefined : "pointer-events-none",
							]
								.filter(Boolean)
								.join(" ")}
							aria-hidden={child.props.interactive ? undefined : true}
						>
							<div
								className={["relative h-full w-full", child.props.className]
									.filter(Boolean)
									.join(" ")}
							>
								{child.props.children}
							</div>
						</div>
					))}
				</div>
			) : null}
			<div className={innerClass} data-section-frame="">
				{foregroundChildren}
			</div>
		</Tag>
	);
}

type SectionComponent = typeof SectionRoot & {
	Background: typeof SectionBackground;
};

export const Section = Object.assign(SectionRoot, {
	Background: SectionBackground,
}) as SectionComponent;
