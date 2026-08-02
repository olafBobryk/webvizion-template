import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ComponentExportProviders } from "./ComponentExportProviders";
import { ComponentExportSurface } from "./ComponentExportSurface";

const meta = {
	id: "ui-guides-figma-export",
	title: "UI/Guides/Figma Export",
	tags: ["!autodocs"],
	parameters: {
		layout: "fullscreen",
		controls: { disable: true },
		a11y: { test: "error" },
	},
	globals: { appearance: "light" },
	decorators: [
		(Story) => (
			<ComponentExportProviders>
				<Story />
			</ComponentExportProviders>
		),
	],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
	render: () => <ComponentExportSurface sectionId="overview" />,
};
export const Foundations: Story = {
	render: () => <ComponentExportSurface sectionId="foundations" />,
};
export const Icons: Story = {
	render: () => <ComponentExportSurface sectionId="icons" />,
};
export const Helpers: Story = {
	render: () => <ComponentExportSurface sectionId="helpers" />,
};
export const Primitives: Story = {
	render: () => <ComponentExportSurface sectionId="primitives" />,
};
export const Input: Story = {
	render: () => <ComponentExportSurface sectionId="input" />,
};
export const Time: Story = {
	render: () => <ComponentExportSurface sectionId="time" />,
};
export const Misc: Story = {
	render: () => <ComponentExportSurface sectionId="misc" />,
};
export const Overlays: Story = {
	render: () => <ComponentExportSurface sectionId="overlays" />,
};
export const Assistant: Story = {
	render: () => <ComponentExportSurface sectionId="assistant" />,
};
export const Utilities: Story = {
	render: () => <ComponentExportSurface sectionId="utilities" />,
};
