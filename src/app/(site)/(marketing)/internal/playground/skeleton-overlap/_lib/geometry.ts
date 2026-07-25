export const SKELETON_OVERLAP_TOLERANCE = 0.5;
export const SKELETON_OVERLAP_STABILITY_TOLERANCE = 0.01;

export const skeletonOverlapFixture = {
	description: "Used to compare loaded and loading field geometry.",
	label: "Workspace name",
	value: "Averlo workspace",
} as const;

export const skeletonGeometrySlots = [
	"root",
	"label",
	"description",
	"inputFrame",
] as const;

export type SkeletonGeometrySlot = (typeof skeletonGeometrySlots)[number];
export type SkeletonGeometryLayerName = "live" | "skeleton";

export type SkeletonGeometryRect = {
	top: number;
	right: number;
	bottom: number;
	left: number;
	width: number;
	height: number;
};

export type SkeletonGeometryLayer = Record<
	SkeletonGeometrySlot,
	SkeletonGeometryRect
>;

export type SkeletonGeometryMeasurements = Record<
	SkeletonGeometryLayerName,
	SkeletonGeometryLayer
>;

export type SkeletonGeometryDeltas = Pick<
	SkeletonGeometryRect,
	"bottom" | "left" | "right" | "top"
>;

export type SkeletonGeometrySlotResult = {
	deltas: SkeletonGeometryDeltas;
	intersectionOverUnion: number;
	maxEdgeDelta: number;
	pass: boolean;
	slot: SkeletonGeometrySlot;
};

export type SkeletonGeometryCollision = {
	first: Exclude<SkeletonGeometrySlot, "root">;
	intersectionArea: number;
	layer: SkeletonGeometryLayerName;
	second: Exclude<SkeletonGeometrySlot, "root">;
};

export type SkeletonGeometryOverflow = {
	bottom: number;
	layer: SkeletonGeometryLayerName;
	left: number;
	right: number;
	slot: Exclude<SkeletonGeometrySlot, "root">;
	top: number;
};

export type SkeletonGeometryVerdict = {
	collisions: SkeletonGeometryCollision[];
	overflows: SkeletonGeometryOverflow[];
	pass: boolean;
	slots: SkeletonGeometrySlotResult[];
	tolerance: number;
};

const pairedCollisionSlots = [
	["label", "description"],
	["label", "inputFrame"],
	["description", "inputFrame"],
] as const satisfies ReadonlyArray<
	readonly [
		Exclude<SkeletonGeometrySlot, "root">,
		Exclude<SkeletonGeometrySlot, "root">,
	]
>;

function absoluteDelta(first: number, second: number) {
	return Math.abs(first - second);
}

function getEdgeDeltas(
	live: SkeletonGeometryRect,
	skeleton: SkeletonGeometryRect,
): SkeletonGeometryDeltas {
	return {
		bottom: absoluteDelta(live.bottom, skeleton.bottom),
		left: absoluteDelta(live.left, skeleton.left),
		right: absoluteDelta(live.right, skeleton.right),
		top: absoluteDelta(live.top, skeleton.top),
	};
}

function getRectDeltas(
	first: SkeletonGeometryRect,
	second: SkeletonGeometryRect,
) {
	return {
		...getEdgeDeltas(first, second),
		height: absoluteDelta(first.height, second.height),
		width: absoluteDelta(first.width, second.width),
	};
}

function getIntersection(
	first: SkeletonGeometryRect,
	second: SkeletonGeometryRect,
) {
	const width = Math.max(
		0,
		Math.min(first.right, second.right) - Math.max(first.left, second.left),
	);
	const height = Math.max(
		0,
		Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top),
	);
	return { area: width * height, height, width };
}

function getIntersectionOverUnion(
	first: SkeletonGeometryRect,
	second: SkeletonGeometryRect,
) {
	const intersection = getIntersection(first, second).area;
	const union =
		first.width * first.height + second.width * second.height - intersection;
	return union > 0 ? intersection / union : 1;
}

function getOverflow(root: SkeletonGeometryRect, slot: SkeletonGeometryRect) {
	return {
		bottom: Math.max(0, slot.bottom - root.bottom),
		left: Math.max(0, root.left - slot.left),
		right: Math.max(0, slot.right - root.right),
		top: Math.max(0, root.top - slot.top),
	};
}

function maxValue(values: Record<string, number>) {
	return Math.max(...Object.values(values));
}

export function measurementsAreStable(
	first: SkeletonGeometryMeasurements,
	second: SkeletonGeometryMeasurements,
	tolerance = SKELETON_OVERLAP_STABILITY_TOLERANCE,
) {
	return (["live", "skeleton"] as const).every((layer) =>
		skeletonGeometrySlots.every((slot) => {
			const deltas = getRectDeltas(first[layer][slot], second[layer][slot]);
			return maxValue(deltas) <= tolerance;
		}),
	);
}

export function evaluateSkeletonGeometry(
	measurements: SkeletonGeometryMeasurements,
	tolerance = SKELETON_OVERLAP_TOLERANCE,
): SkeletonGeometryVerdict {
	const slots = skeletonGeometrySlots.map((slot) => {
		const live = measurements.live[slot];
		const skeleton = measurements.skeleton[slot];
		const deltas = getEdgeDeltas(live, skeleton);
		const maxEdgeDelta = maxValue(deltas);
		return {
			deltas,
			intersectionOverUnion: getIntersectionOverUnion(live, skeleton),
			maxEdgeDelta,
			pass: maxEdgeDelta <= tolerance,
			slot,
		};
	});

	const collisions: SkeletonGeometryCollision[] = [];
	const overflows: SkeletonGeometryOverflow[] = [];
	for (const layerName of ["live", "skeleton"] as const) {
		const layer = measurements[layerName];
		for (const [first, second] of pairedCollisionSlots) {
			const intersectionArea = getIntersection(
				layer[first],
				layer[second],
			).area;
			if (intersectionArea > 0) {
				collisions.push({
					first,
					intersectionArea,
					layer: layerName,
					second,
				});
			}
		}

		for (const slot of ["label", "description", "inputFrame"] as const) {
			const overflow = getOverflow(layer.root, layer[slot]);
			if (maxValue(overflow) > 0) {
				overflows.push({ layer: layerName, slot, ...overflow });
			}
		}
	}

	return {
		collisions,
		overflows,
		pass:
			slots.every((slot) => slot.pass) &&
			collisions.length === 0 &&
			overflows.length === 0,
		slots,
		tolerance,
	};
}
