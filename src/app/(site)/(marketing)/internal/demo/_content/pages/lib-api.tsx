"use client";

import { useState } from "react";
import { Loader } from "@/components/ui/misc";
import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/Panel";
import { Text } from "@/components/ui/primitives/Text";
import {
	type ApiError,
	checkHealth,
	createApiClient,
	createMockFetch,
} from "@/lib/api";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

const mockHealthSuccessClient = createApiClient({
	baseUrl: "https://demo.api.local",
	fetcher: createMockFetch([
		{
			matcher: "/",
			method: "GET",
			response: {
				delayMs: 600,
				body: { message: "Service is healthy." },
			},
		},
	]),
});

const mockHealthErrorClient = createApiClient({
	baseUrl: "https://demo.api.local",
	fetcher: createMockFetch([
		{
			matcher: "/",
			method: "GET",
			response: {
				delayMs: 600,
				status: 503,
				body: {
					message: "Service is unavailable.",
					retryAfterSeconds: 30,
				},
			},
		},
	]),
});

export const libApiDemoPage: DemoPage = {
	id: "lib-api",
	slug: ["lib", "api"],
	title: "Lib API",
	description: "Transport helpers, mocks, and endpoint wrappers",
	groups: [
		{
			id: "api",
			title: "API",
			description: "Project and external API helpers",
			items: [
				{
					id: "api-client-demo",
					kind: "component",
					name: "API client",
					label: "Mocked transport with real wrapper",
					related: relatedMap.createApiClient,
					Render() {
						const [status, setStatus] = useState<
							"idle" | "loading" | "success" | "error"
						>("idle");
						const [message, setMessage] = useState(
							"Run the health check against a mocked transport.",
						);

						const runCheck = async (
							requester: typeof mockHealthSuccessClient.request,
						) => {
							setStatus("loading");
							setMessage("Request in flight...");

							try {
								const payload = await checkHealth(requester);
								setStatus("success");
								setMessage(payload.message);
							} catch (error) {
								const apiError = error as ApiError;
								setStatus("error");
								setMessage(apiError.payload?.message ?? apiError.message);
							}
						};

						return (
							<div className="flex flex-col gap-3">
								<div className="flex flex-wrap gap-2">
									<Button
										size="sm"
										onClick={() => runCheck(mockHealthSuccessClient.request)}
									>
										Mock success
									</Button>
									<Button
										size="sm"
										variant="secondary"
										onClick={() => runCheck(mockHealthErrorClient.request)}
									>
										Mock error
									</Button>
								</div>

								<Panel
									padding="sm"
									shadow="none"
									className="border border-border/15"
								>
									<div className="flex flex-col gap-2">
										{status === "loading" ? (
											<div className="flex items-center gap-2">
												<Loader />
												<Text variant="body" tone="muted">
													Request in flight...
												</Text>
											</div>
										) : (
											<Text
												variant="body"
												className={
													status === "error" ? "text-danger" : undefined
												}
											>
												{message}
											</Text>
										)}
										<Text variant="caption" tone="muted">
											Uses <code>checkHealth</code> with{" "}
											<code>
												{"createApiClient({ fetcher: createMockFetch(...) })"}
											</code>
											.
										</Text>
									</div>
								</Panel>
							</div>
						);
					},
				},
			],
		},
	],
};
