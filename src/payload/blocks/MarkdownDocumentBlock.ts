import type { Block } from "payload";

export const MarkdownDocumentBlock: Block = {
	slug: "markdownDocument",
	interfaceName: "MarkdownDocumentContentBlock",
	labels: {
		plural: "Markdown documents",
		singular: "Markdown document",
	},
	fields: [
		{
			name: "date",
			type: "date",
			required: true,
			admin: {
				description: "The document date rendered by the shared DateIndicator.",
			},
		},
		{
			name: "markdown",
			type: "textarea",
			required: true,
		},
	],
};
