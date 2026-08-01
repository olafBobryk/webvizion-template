import type { ElementType } from "react";
import { Panel, type PanelProps } from "./Panel";

export type FloatProps<T extends ElementType = "div"> = PanelProps<T>;

export function Float<T extends ElementType = "div">({
	background = "float",
	border = "subtle",
	display = "block",
	elevation = "float",
	gap = "none",
	overflow = "hidden",
	padding = "none",
	radius = "float",
	width = "auto",
	...props
}: FloatProps<T>) {
	const PanelRoot = Panel as ElementType;

	return (
		<PanelRoot
			background={background}
			border={border}
			data-elevation={elevation}
			data-slot="float"
			data-surface-role="float"
			display={display}
			elevation={elevation}
			gap={gap}
			overflow={overflow}
			padding={padding}
			radius={radius}
			width={width}
			{...props}
		/>
	);
}
