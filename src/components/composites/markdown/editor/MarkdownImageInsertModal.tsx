import * as React from "react";
import { TextInput } from "@/components/ui/input";
import { ModalForm } from "@/components/ui/overlays/modal/ModalForm";
import {
	ModalHeader,
	ModalTitle,
} from "@/components/ui/overlays/modal/ModalShell";
import { Button } from "@/components/ui/primitives/Button";
import { markdownToolbarIcon } from "./MarkdownToolbarControls";

export function MarkdownImageInsertModal({
	onCancel,
	onInsert,
}: {
	onCancel: () => void;
	onInsert: (src: string, altText: string) => void;
}) {
	const [altText, setAltText] = React.useState("");
	const [src, setSrc] = React.useState("");
	const [error, setError] = React.useState<string>();

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedSrc = src.trim();
		if (!normalizedSrc) {
			setError("Enter an image URL.");
			return;
		}
		onInsert(normalizedSrc, altText.trim());
		onCancel();
	}

	return (
		<>
			<ModalHeader leadingIcon={markdownToolbarIcon("image")}>
				<ModalTitle>Insert image</ModalTitle>
			</ModalHeader>
			<ModalForm
				contentClassName="grid gap-3"
				footer={
					<>
						<Button onClick={onCancel} type="button" variant="ghost">
							Cancel
						</Button>
						<Button type="submit" variant="primary">
							Insert
						</Button>
					</>
				}
				onSubmit={handleSubmit}
			>
				<TextInput
					error={error}
					inputMode="url"
					label="Image URL"
					onChange={(value) => {
						setSrc(value);
						if (error) setError(undefined);
					}}
					placeholder="https://example.com/image.jpg"
					value={src}
				/>
				<TextInput
					label="Alternative text"
					onChange={setAltText}
					placeholder="Describe the image"
					value={altText}
				/>
			</ModalForm>
		</>
	);
}
