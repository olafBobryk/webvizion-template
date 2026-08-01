import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { formatCatalogOwnerContract } from "@/lib/component-catalog/contract";
import { catalogContract } from "./MotionTiming.catalog";
import {
	getMotionCssVariables,
	getMotionTiming,
	motionTiming,
} from "./motionTiming";
import { getSpring, spring } from "./spring";

const meta = {
	id: "ui-foundations-motion-timing",
	excludeStories: ["catalogContract"],
	title: "UI/Foundations/Motion Timing and Spring",
	tags: ["autodocs"],
	parameters: {
		catalogContract,
		a11y: { test: "error" },
		docs: {
			description: { component: formatCatalogOwnerContract(catalogContract) },
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const MomentHierarchy: Story = {
	render: () => {
		const variables = getMotionCssVariables();
		return (
			<dl className="grid grid-cols-2 gap-2" data-testid="timing-table">
				<dt>Feedback</dt>
				<dd>{String(motionTiming.feedback.duration)}</dd>
				<dt>Overlay</dt>
				<dd>{String(motionTiming.overlay.duration)}</dd>
				<dt>Reveal</dt>
				<dd>{String(getMotionTiming("grand").duration)}</dd>
				<dt>CSS token</dt>
				<dd>
					{String(
						variables["--motion-overlay-duration" as keyof typeof variables],
					)}
				</dd>
			</dl>
		);
	},
	play: async ({ canvas }) => {
		const values = canvas.getByTestId("timing-table").querySelectorAll("dd");
		await expect(Number(values[0]?.textContent)).toBeLessThan(
			Number(values[1]?.textContent),
		);
		await expect(Number(values[1]?.textContent)).toBeLessThan(
			Number(values[2]?.textContent),
		);
		await expect(values[3]).toHaveTextContent("320ms");
	},
};

export const ResolvedSprings: Story = {
	render: () => (
		<dl className="grid grid-cols-2 gap-2">
			<dt>Interactive type</dt>
			<dd data-testid="spring-type">{String(spring.interaction.type)}</dd>
			<dt>Strong stiffness</dt>
			<dd data-testid="spring-stiffness">
				{String(getSpring("overlay", { intensity: "strong" }).stiffness)}
			</dd>
		</dl>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId("spring-type")).toHaveTextContent("spring");
		await expect(
			Number(canvas.getByTestId("spring-stiffness").textContent),
		).toBeGreaterThan(180);
	},
};
