"use client";

import type { FormEvent } from "react";
import Logo from "@/components/branding/Logo";
import { Icon } from "@/components/ui/icons/Icon";
import { TextInput } from "@/components/ui/input";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalDescription,
	ModalHeader,
	ModalTitle,
	useModalSubmission,
} from "@/components/ui/overlays/modal/ModalShell";
import { useModal } from "@/components/ui/overlays/modal/useModal";
import { Button } from "@/components/ui/primitives/Button";
import { showToast } from "@/lib/feedback";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

function AsyncMutationModalDemo({
	onCancel,
	onSaved,
}: {
	onCancel: () => void;
	onSaved: () => void;
}) {
	const { beginSubmission, endSubmission, isSubmitting } = useModalSubmission();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!beginSubmission()) return;
		let shouldEndSubmission = true;
		try {
			await new Promise((resolve) => window.setTimeout(resolve, 2500));
			shouldEndSubmission = false;
			onSaved();
		} finally {
			if (shouldEndSubmission) endSubmission();
		}
	}

	return (
		<>
			<ModalHeader leadingIcon={<Icon name="pencil" size="sm" />}>
				<ModalTitle>Async mutation</ModalTitle>
				<ModalDescription>
					Submitting locks dismissal and conflicting actions.
				</ModalDescription>
			</ModalHeader>
			<ModalForm
				footer={
					<>
						<Button
							disabled={isSubmitting}
							onClick={onCancel}
							type="button"
							variant="ghost"
						>
							Cancel
						</Button>
						<Button loading={isSubmitting} type="submit">
							Save
						</Button>
					</>
				}
				onSubmit={handleSubmit}
			>
				<TextInput defaultValue="Async mutation" label="Title" name="title" />
			</ModalForm>
		</>
	);
}

export const brandingDemoPage: DemoPage = {
	id: "branding",
	slug: ["branding"],
	title: "Branding",
	description: "Identity atoms",
	groups: [
		{
			id: "branding-core",
			title: "Branding",
			description: "Identity atoms",
			items: [
				{
					id: "async-mutation-modal",
					kind: "component",
					name: "useModalSubmission",
					label: "Async mutation modal",
					Render() {
						const { openModal } = useModal();

						return (
							<div className="grid gap-3">
								<Button
									size="sm"
									variant="secondary"
									onClick={() =>
										openModal(
											({ close }) => (
												<AsyncMutationModalDemo
													onCancel={close}
													onSaved={() => {
														showToast.success("Saved demo mutation.");
														close();
													}}
												/>
											),
											{
												ariaLabel: "Async mutation",
												id: "async-mutation-demo",
											},
										)
									}
								>
									Open async mutation modal
								</Button>
								<pre className="overflow-x-auto rounded-md border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
									<code>{`const { beginSubmission, endSubmission, isSubmitting } =
  useModalSubmission();

if (!beginSubmission()) return;
let shouldEndSubmission = true;
try {
  await saveAction(formData);
  shouldEndSubmission = false;
  close();
} finally {
  if (shouldEndSubmission) endSubmission();
}`}</code>
								</pre>
							</div>
						);
					},
				},
				{
					id: "logo",
					kind: "component",
					name: "Logo",
					label: "Wordmark + mark",
					related: relatedMap.Logo,
					Render() {
						return (
							<div className="flex flex-col gap-3">
								<div className="flex items-center gap-3">
									<Logo size="sm" />
									<Logo size="md" />
									<Logo size="lg" />
								</div>
								<div className="flex items-center gap-3">
									<Logo size="sm" variant="mark" />
									<Logo size="md" variant="mark" />
									<Logo size="lg" variant="mark" />
								</div>
								<div className="flex items-center gap-3 rounded-lg bg-foreground px-3 py-2">
									<Logo size="sm" tone="light" />
									<Logo size="sm" variant="mark" tone="light" />
								</div>
							</div>
						);
					},
				},
			],
		},
	],
};
