import type { Meta, StoryObj } from "@storybook/react";
import * as Assistant from "./index";

const fixture = {
	id: "message-user-fixture-must-not-be-meta",
	parts: [{ id: "part-before-meta", text: "Hello" }],
};

const meta = {
	id: "domain-assistant-message",
	title: "Domain/Assistant/Message",
	component: Assistant.Message,
	parameters: {
		docs: {
			description: {
				component: "The public Assistant message dispatcher.",
			},
		},
	},
} satisfies Meta<typeof Assistant.Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { message: fixture } };
