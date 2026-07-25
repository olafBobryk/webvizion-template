"use client";

import * as React from "react";
import {
	EmailInput,
	SpamProtectionFields,
	TextAreaInput,
	TextInput,
} from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Field } from "@/components/ui/primitives/Field";
import {
	InputFrame,
	inputVariants,
} from "@/components/ui/primitives/InputFrame";
import { Text } from "@/components/ui/primitives/Text";
import { submitSpamProtectedExample } from "@/lib/api";
import { showToast } from "@/lib/feedback";

function ExampleFileInput({
	error,
	file,
	onChange,
}: {
	error?: string;
	file: File | null;
	onChange: (file: File | null) => void;
}) {
	const inputId = React.useId();
	const descriptionId = `${inputId}-description`;
	const messageId = error ? `${inputId}-message` : undefined;
	const describedBy =
		[descriptionId, messageId].filter(Boolean).join(" ") || undefined;
	const tone = error ? "error" : "default";

	return (
		<Field
			label="Attachment"
			description="PDF only, up to 3 files total, 5 MB each, 10 MB combined."
			message={error}
			tone={tone}
			inputId={inputId}
			descriptionId={descriptionId}
			messageId={messageId}
		>
			<InputFrame tone={tone} fullWidth>
				<input
					id={inputId}
					type="file"
					name="attachment"
					accept=".pdf,application/pdf"
					onChange={(event) => {
						onChange(event.target.files?.[0] ?? null);
					}}
					aria-invalid={Boolean(error)}
					aria-describedby={describedBy}
					className={inputVariants()}
				/>
			</InputFrame>
			{file ? (
				<Text variant="caption" tone="muted">
					Selected file: {file.name}
				</Text>
			) : null}
		</Field>
	);
}

export function SpamProtectedFormPreview() {
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [attachment, setAttachment] = React.useState<File | null>(null);
	const [errors, setErrors] = React.useState<{
		name?: string;
		email?: string;
		message?: string;
	}>({});
	const [submitting, setSubmitting] = React.useState(false);
	const [fileInputResetKey, setFileInputResetKey] = React.useState(0);
	const formRef = React.useRef<HTMLFormElement>(null);

	function validateEmail(value: string) {
		if (!value.trim()) return "Email is required.";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
			return "Please enter a valid email.";
		}
		return null;
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (submitting) return;

		const nextErrors = {
			name: name.trim() ? undefined : "Name is required.",
			email: validateEmail(email) ?? undefined,
			message: message.trim() ? undefined : "Message is required.",
		};

		if (nextErrors.name || nextErrors.email || nextErrors.message) {
			setErrors(nextErrors);
			return;
		}

		setSubmitting(true);
		try {
			await showToast.promise(
				submitSpamProtectedExample({
					name,
					email,
					message,
					attachment,
				}),
				{
					loading: "Submitting example form...",
					success: "Example form accepted.",
					error: "Example form rejected.",
				},
			);
			formRef.current?.reset();
			setName("");
			setEmail("");
			setMessage("");
			setAttachment(null);
			setErrors({});
			setFileInputResetKey((current) => current + 1);
		} catch {
			// toast already updated by showToast.promise
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<Card>
			<Card.Header className="border-b">
				<Card.Title>Working preview</Card.Title>
				<Card.Description>
					Submit once to set the cooldown cookie, then submit again within 60
					seconds to see the server-side throttle response.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form
					ref={formRef}
					onSubmit={handleSubmit}
					noValidate
					className="flex w-full flex-col gap-6"
				>
					<TextInput
						label="Name"
						name="name"
						required
						value={name}
						onChange={(value) => {
							setName(value);
							setErrors((current) => ({ ...current, name: undefined }));
						}}
						error={errors.name}
					/>
					<EmailInput
						label="Email"
						name="email"
						required
						value={email}
						onChange={(value) => {
							setEmail(value);
							setErrors((current) => ({ ...current, email: undefined }));
						}}
						error={errors.email}
					/>
					<TextAreaInput
						label="Message"
						name="message"
						required
						rows={4}
						value={message}
						onChange={(value) => {
							setMessage(value);
							setErrors((current) => ({ ...current, message: undefined }));
						}}
						error={errors.message}
					/>
					<div key={fileInputResetKey}>
						<ExampleFileInput file={attachment} onChange={setAttachment} />
					</div>
					<SpamProtectionFields />
					<div className="flex flex-wrap gap-3">
						<Button type="submit" variant="primary" loading={submitting}>
							Submit example form
						</Button>
						<Button
							type="button"
							variant="secondary"
							onClick={() => {
								formRef.current?.reset();
								setName("");
								setEmail("");
								setMessage("");
								setAttachment(null);
								setErrors({});
								setFileInputResetKey((current) => current + 1);
							}}
							disabled={submitting}
						>
							Reset
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card>
	);
}
