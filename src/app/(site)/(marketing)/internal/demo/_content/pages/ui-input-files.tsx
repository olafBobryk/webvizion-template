"use client";

import { useState } from "react";
import { FileInput, type FileInputItem } from "@/components/ui/input";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiInputFilesDemoPage: DemoPage = {
	id: "ui-input-files",
	slug: ["ui", "input", "files"],
	title: "UI Input: Files",
	description: "File selection + previews",
	groups: [
		{
			id: "file-inputs",
			title: "File Inputs",
			description: "File selection + previews",
			columns: "grid-cols-1 lg:grid-cols-2",
			items: [
				{
					id: "file-input",
					kind: "component",
					name: "FileInput",
					label: "Selection + previews",
					related: relatedMap.FileInput,
					className: "lg:col-span-2",
					Render() {
						const [items, setItems] = useState<FileInputItem[]>([
							{
								key: "saved-image",
								name: "mercury.png",
								status: "uploaded",
								type: "image/png",
								url: "/test/mercury.png",
							},
						]);
						const [emptyItems, setEmptyItems] = useState<FileInputItem[]>([]);

						return (
							<div className="grid gap-6">
								<FileInput
									accept="image/*,application/pdf"
									items={items}
									onItemsChange={setItems}
									label="Attachments"
									description="Add, drop, inspect, and remove images or PDFs. Other file types are rejected inline."
									labels={{ uploaded: "Saved" }}
								/>
								<div className="grid gap-4 md:grid-cols-3">
									<FileInput
										items={emptyItems}
										label="Empty editable"
										onItemsChange={setEmptyItems}
									/>
									<FileInput
										items={items}
										label="Read only"
										mode="read"
										onItemsChange={setItems}
									/>
									<FileInput
										disabled
										items={items}
										label="Disabled"
										onItemsChange={setItems}
									/>
								</div>
							</div>
						);
					},
				},
			],
		},
	],
};
