import type { Block } from "payload";
import { templateServiceSurfaceIds } from "@/lib/marketing-content/types";
import { siteLinkFields } from "@/payload/fields/siteLinkFields";

export const HomeHeroBlock: Block = {
	slug: "homeHero",
	interfaceName: "HomeHeroSectionBlock",
	labels: {
		singular: "Home hero",
		plural: "Home heroes",
	},
	fields: [
		{
			name: "headline",
			type: "text",
			required: true,
		},
		{
			name: "descriptions",
			type: "array",
			required: true,
			minRows: 1,
			fields: [
				{
					name: "text",
					type: "textarea",
					required: true,
				},
			],
		},
		{
			name: "cta",
			type: "group",
			required: true,
			fields: siteLinkFields,
		},
		{
			name: "services",
			type: "array",
			required: true,
			minRows: 1,
			fields: [
				{
					name: "serviceId",
					type: "text",
					required: true,
				},
				{
					name: "title",
					type: "text",
					required: true,
				},
				{
					name: "description",
					type: "textarea",
					required: true,
				},
				{
					name: "surfaceIds",
					type: "select",
					hasMany: true,
					required: true,
					options: templateServiceSurfaceIds.map((surfaceId) => ({
						label: surfaceId,
						value: surfaceId,
					})),
				},
			],
		},
	],
};
