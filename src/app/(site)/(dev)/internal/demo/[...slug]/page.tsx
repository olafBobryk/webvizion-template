"use client";

import * as React from "react";
import { DemoPage } from "../_components/DemoPage";
import { demoPages } from "../content";

export default function DemoSlugPage({
	params,
}: {
	params: Promise<{ slug: string[] }>;
}) {
	const { slug } = React.use(params);
	const isSkeletonMode = slug[slug.length - 1] === "skeleton";
	const baseSlug = isSkeletonMode ? slug.slice(0, -1) : slug;
	const page = demoPages.find(
		(entry) => entry.slug.join("/") === baseSlug.join("/"),
	);

	return <DemoPage page={page} mode={isSkeletonMode ? "skeleton" : "full"} />;
}
