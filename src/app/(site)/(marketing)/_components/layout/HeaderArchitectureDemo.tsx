import clsx from "clsx";

const toneClasses = {
	shell: "border-rose-500 bg-rose-500",
	topBar: "border-sky-500 bg-sky-500",
	menu: "border-violet-500 bg-violet-500",
	search: "border-amber-500 bg-amber-500",
	results: "border-emerald-500 bg-emerald-500",
} as const;

type DemoTone = keyof typeof toneClasses;

const placementClasses = {
	topLeft: "left-1 top-1",
	topRight: "right-1 top-1",
	bottomLeft: "bottom-1 left-1",
	bottomRight: "bottom-1 right-1",
} as const;

type DemoPlacement = keyof typeof placementClasses;

// Temporary visual-only aid for reviewing the responsive header architecture.
export default function HeaderArchitectureDemo({
	label,
	placement = "topLeft",
	tone,
	className,
}: {
	label: string;
	placement?: DemoPlacement;
	tone: DemoTone;
	className?: string;
}) {
	if (process.env.NODE_ENV !== "development") return null;

	return (
		<div
			aria-hidden="true"
			data-header-architecture-demo={tone}
			className={clsx(
				"pointer-events-none absolute inset-0 z-40 border-2 border-dashed bg-transparent",
				toneClasses[tone].split(" ")[0],
				className,
			)}
		>
			<span
				className={clsx(
					"absolute rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm",
					toneClasses[tone].split(" ")[1],
					placementClasses[placement],
				)}
			>
				{label}
			</span>
		</div>
	);
}
