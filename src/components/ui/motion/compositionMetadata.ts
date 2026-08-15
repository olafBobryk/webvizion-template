export type MotionCompositionFocus = "section" | "page" | "shell" | "site";

export type MotionCompositionMetadata = {
	schemaVersion: 1;
	focusHints: readonly MotionCompositionFocus[];
	/**
	 * Product-neutral structural identity. An exact match requires the approved
	 * composition's source, effects, sequencing, and reduced-motion treatment.
	 */
	staticPattern: string;
	role: string;
	sources: readonly string[];
	effects: readonly string[];
	status: "approved" | "candidate";
};
