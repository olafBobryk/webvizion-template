import type { CollectionConfig } from "payload";
import { HomeHeroBlock } from "../blocks/HomeHeroBlock";

export const Pages: CollectionConfig = {
	slug: "pages",
	admin: {
		group: "Content",
		useAsTitle: "title",
		defaultColumns: ["title", "slug", "updatedAt"],
	},
	access: {
		read: () => true,
	},
	versions: {
		drafts: true,
	},
	fields: [
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			name: "description",
			type: "textarea",
			required: true,
			admin: {
				description:
					"Source-neutral page summary used for document and social metadata.",
			},
		},
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			admin: {
				description: 'Use "home" for the homepage.',
			},
		},
		{
			name: "layout",
			type: "blocks",
			required: true,
			blocks: [HomeHeroBlock],
		},
	],
};
