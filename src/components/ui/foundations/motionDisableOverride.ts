"use client";

import * as React from "react";

function hasMotionDisabledSearchParam() {
	if (typeof window === "undefined") return false;

	const params = new URLSearchParams(window.location.search);
	const motion = params.get("motion")?.toLowerCase();
	const reveal = params.get("reveal")?.toLowerCase();

	return (
		motion === "off" ||
		motion === "false" ||
		reveal === "off" ||
		reveal === "false"
	);
}

export function hasIntroDisabledSearchParam() {
	if (typeof window === "undefined") return false;

	const params = new URLSearchParams(window.location.search);
	const intro = params.get("intro")?.toLowerCase();
	const loading = params.get("loading")?.toLowerCase();

	return (
		intro === "off" ||
		intro === "false" ||
		loading === "off" ||
		loading === "false" ||
		hasMotionDisabledSearchParam()
	);
}

function hasIntroDisabledDocumentOverride() {
	if (typeof document === "undefined") return false;
	return document.documentElement.dataset.loadingOverride === "off";
}

function hasMotionDisabledDocumentOverride() {
	if (typeof document === "undefined") return false;
	return document.documentElement.dataset.motionOverride === "off";
}

export function useIntroDisableOverride() {
	const [disabled, setDisabled] = React.useState(false);

	React.useEffect(() => {
		const update = () =>
			setDisabled(
				hasIntroDisabledDocumentOverride() || hasIntroDisabledSearchParam(),
			);
		update();
		window.addEventListener("popstate", update);
		return () => window.removeEventListener("popstate", update);
	}, []);

	return disabled;
}

export function useMotionDisableOverride() {
	const [disabled, setDisabled] = React.useState(false);

	React.useEffect(() => {
		const update = () =>
			setDisabled(
				hasMotionDisabledDocumentOverride() || hasMotionDisabledSearchParam(),
			);
		update();
		window.addEventListener("popstate", update);
		return () => window.removeEventListener("popstate", update);
	}, []);

	return disabled;
}
