"use client";

import { useEffect } from "react";

const COMPOSITION_REVIEW_ATTRIBUTE = "data-composition-review";

/** Installs the automation-only content-plus-footer review state. */
export function CompositionReviewState() {
	useEffect(() => {
		const root = document.documentElement;
		const review = new URLSearchParams(window.location.search).get("review");

		if (review === "composition") {
			root.setAttribute(COMPOSITION_REVIEW_ATTRIBUTE, "active");
		}

		return () => {
			root.removeAttribute(COMPOSITION_REVIEW_ATTRIBUTE);
		};
	}, []);

	return null;
}
