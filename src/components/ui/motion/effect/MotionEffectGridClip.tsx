"use client";

import { motion, useTransform } from "motion/react";
import {
	type HTMLAttributes,
	type ReactNode,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import styles from "./MotionEffectGridClip.module.css";
import { useMotionEffectProgress } from "./progress";

type GridDimensions = { columns: number; rows: number };

type MotionEffectGridClipOwnProps = {
	children: ReactNode;
	maxColumns?: number;
	minColumns?: number;
	range?: readonly [number, number];
	targetCellAspectRatio?: number;
};

export type MotionEffectGridClipProps = MotionEffectGridClipOwnProps &
	Omit<HTMLAttributes<HTMLDivElement>, keyof MotionEffectGridClipOwnProps>;

const DEFAULT_GRID = { columns: 8, rows: 5 };
const TARGET_TILE_WIDTH = 96;
const GRID_STAGGER_SPAN = 0.7;
const GRID_CLIP_WINDOW = 0.3;
const TILE_MASK_OVERLAP = 0.001;

function clamp(value: number, minimum: number, maximum: number) {
	return Math.min(Math.max(value, minimum), maximum);
}

export function getGridClipDimensions(
	width: number,
	height: number,
	{
		targetCellAspectRatio = 3 / 4,
		minColumns = 6,
		maxColumns = 18,
	}: Pick<
		MotionEffectGridClipOwnProps,
		"targetCellAspectRatio" | "minColumns" | "maxColumns"
	> = {},
): GridDimensions {
	if (
		!Number.isFinite(width) ||
		!Number.isFinite(height) ||
		width <= 0 ||
		height <= 0
	)
		return DEFAULT_GRID;

	const minimum = Math.max(2, Math.round(minColumns));
	const maximum = Math.max(minimum, Math.round(maxColumns));
	const aspect = Number.isFinite(targetCellAspectRatio)
		? clamp(targetCellAspectRatio, 0.35, 1.5)
		: 3 / 4;
	const columns = clamp(
		Math.round(width / TARGET_TILE_WIDTH),
		minimum,
		maximum,
	);
	const targetRows = Math.round(height / (width / columns / aspect));
	const maximumRows = Math.max(3, Math.floor(columns * 0.75));
	const rows = clamp(Math.min(targetRows, maximumRows), 2, maximumRows);

	return { columns, rows };
}

function GridMaskTile({
	column,
	columns,
	progress,
	row,
	rows,
}: {
	column: number;
	columns: number;
	progress: ReturnType<typeof useMotionEffectProgress>["progress"];
	row: number;
	rows: number;
}) {
	const direction = row % 2 === 0 ? "ltr" : "rtl";
	const orderedColumn = direction === "ltr" ? column : columns - column - 1;
	const start = (orderedColumn / Math.max(1, columns - 1)) * GRID_STAGGER_SPAN;
	const end = Math.min(1, start + GRID_CLIP_WINDOW);
	const cellWidth = 1 / columns;
	const cellHeight = 1 / rows;
	const x = Math.max(0, column * cellWidth - TILE_MASK_OVERLAP / 2);
	const y = Math.max(0, row * cellHeight - TILE_MASK_OVERLAP / 2);
	const width = Math.min(1 - x, cellWidth + TILE_MASK_OVERLAP);
	const height = Math.min(1 - y, cellHeight + TILE_MASK_OVERLAP);
	const clippedWidth = useTransform(progress, [start, end], [0, width], {
		clamp: true,
	});
	const rightToLeftX = useTransform(progress, [start, end], [x + width, x], {
		clamp: true,
	});

	return (
		<motion.rect
			data-motion-grid-clip-column={column}
			data-motion-grid-clip-direction={direction}
			data-motion-grid-clip-end={end.toFixed(3)}
			data-motion-grid-clip-row={row}
			data-motion-grid-clip-start={start.toFixed(3)}
			data-motion-grid-clip-tile=""
			fill="white"
			height={height}
			width={clippedWidth}
			x={direction === "ltr" ? x : rightToLeftX}
			y={y}
		/>
	);
}

/** A responsive grid mask driven exclusively by the nearest MotionSource. */
export function MotionEffectGridClip({
	children,
	className,
	maxColumns,
	minColumns,
	range = [0, 1],
	style,
	targetCellAspectRatio,
	...rest
}: MotionEffectGridClipProps) {
	const { mode, progress } = useMotionEffectProgress("GridClip", range);
	const maskId = useId().replaceAll(":", "");
	const rootRef = useRef<HTMLDivElement | null>(null);
	const [dimensions, setDimensions] = useState<GridDimensions>(DEFAULT_GRID);
	const [isComplete, setIsComplete] = useState(
		() => mode !== "animated" || progress.get() >= 0.999,
	);

	useEffect(() => {
		if (mode !== "animated") {
			setIsComplete(true);
			return;
		}
		const update = (value = progress.get()) => {
			const next = value >= 0.999;
			setIsComplete((current) => (current === next ? current : next));
		};
		update();
		return progress.on("change", update);
	}, [mode, progress]);

	useLayoutEffect(() => {
		const node = rootRef.current;
		if (!node) return;
		const update = () => {
			const next = getGridClipDimensions(node.clientWidth, node.clientHeight, {
				maxColumns,
				minColumns,
				targetCellAspectRatio,
			});
			setDimensions((current) =>
				current.columns === next.columns && current.rows === next.rows
					? current
					: next,
			);
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	}, [maxColumns, minColumns, targetCellAspectRatio]);

	const tiles = useMemo(
		() =>
			Array.from(
				{ length: dimensions.columns * dimensions.rows },
				(_, index) => ({
					column: index % dimensions.columns,
					row: Math.floor(index / dimensions.columns),
				}),
			),
		[dimensions],
	);

	return (
		<div
			{...rest}
			className={[styles.root, className].filter(Boolean).join(" ")}
			data-motion-effect="grid-clip"
			data-motion-grid-clip-columns={dimensions.columns}
			data-motion-grid-clip-complete={isComplete ? "true" : "false"}
			data-motion-grid-clip-rows={dimensions.rows}
			ref={rootRef}
			style={style}
		>
			<svg aria-hidden="true" className={styles.mask}>
				<defs>
					<mask
						id={maskId}
						maskContentUnits="objectBoundingBox"
						maskUnits="objectBoundingBox"
					>
						{tiles.map(({ column, row }) => (
							<GridMaskTile
								column={column}
								columns={dimensions.columns}
								key={`${row}-${column}`}
								progress={progress}
								row={row}
								rows={dimensions.rows}
							/>
						))}
					</mask>
				</defs>
			</svg>
			<div
				className={styles.visual}
				data-motion-grid-clip-visual=""
				style={{
					WebkitMaskImage: isComplete ? "none" : `url("#${maskId}")`,
					maskImage: isComplete ? "none" : `url("#${maskId}")`,
				}}
			>
				{children}
			</div>
		</div>
	);
}
