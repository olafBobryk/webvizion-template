"use client";

import { Button } from "@/components/ui/primitives/Button";
import { showToast } from "@/lib/feedback";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiOverlaysToastDemoPage: DemoPage = {
	id: "ui-overlays-toast",
	slug: ["ui", "overlays", "toast"],
	title: "UI Overlays: Toast",
	description: "Toast actions",
	groups: [
		{
			id: "toasts",
			title: "Toasts",
			description: "Toast actions",
			items: [
				{
					id: "toast-host",
					kind: "component",
					name: "ToastHost",
					label: "Toast actions",
					related: relatedMap.ToastHost,
					Render() {
						return (
							<div className="flex flex-wrap gap-2">
								<Button
									size="sm"
									variant="secondary"
									onClick={() =>
										showToast.success("Settings saved.", {
											title: "Success",
										})
									}
								>
									Show success
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										showToast.error("Upload failed.", {
											title: "Failed",
										})
									}
								>
									Show error
								</Button>
								<Button
									size="sm"
									variant="ghost"
									onClick={() =>
										showToast.info("Sync will continue in the background.", {
											title: "Info",
										})
									}
								>
									Show info
								</Button>
							</div>
						);
					},
				},
				{
					id: "show-toast-combination",
					kind: "component",
					name: "showToast",
					label: "Promise + stacked actions",
					related: relatedMap.showToast,
					Render() {
						const runPromiseToast = () =>
							showToast.promise(
								new Promise((resolve) =>
									setTimeout(() => resolve("Saved"), 900),
								),
								{
									loading: "Saving changes...",
									success: "Changes saved.",
									error: "Save failed.",
								},
								{
									loadingTitle: "Request",
									successTitle: "Success",
									errorTitle: "Error",
								},
							);

						const runStackedToasts = () => {
							showToast.info("Queued upload started.", {
								title: "Pipeline",
							});
							setTimeout(() => {
								showToast.success("Upload finished.", {
									title: "Pipeline",
								});
							}, 450);
						};

						return (
							<div className="flex flex-wrap gap-2">
								<Button size="sm" onClick={runPromiseToast}>
									Promise toast
								</Button>
								<Button
									size="sm"
									variant="secondary"
									onClick={runStackedToasts}
								>
									Stacked toasts
								</Button>
							</div>
						);
					},
				},
			],
		},
	],
};
