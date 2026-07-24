import type { JSX } from "react";

export type RelatedInfo = { uses: string[]; usedIn: string[] };

export type DemoItemBase = {
	id: string;
	name: string;
	label: string;
	related?: RelatedInfo;
	className?: string;
};

export type DemoSkeletonItem = {
	name?: string;
	label?: string;
	className?: string;
	related?: RelatedInfo;
	Render: () => JSX.Element;
};

export type DemoComponentItem = DemoItemBase & {
	kind: "component";
	Render: () => JSX.Element;
	skeleton?: DemoSkeletonItem;
};

export type DemoItem = DemoComponentItem;

export type DemoGroup = {
	id: string;
	title: string;
	description?: string;
	columns?: string;
	items: DemoItem[];
};

export type DemoPage = {
	id: string;
	slug: string[];
	title: string;
	description?: string;
	visibility?: "public" | "dev-only";
	groups: DemoGroup[];
};
