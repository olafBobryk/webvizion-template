"use client";

import { useState } from "react";
import { IconSwap } from "@/components/ui/helpers/IconSwap";
import { Icon } from "@/components/ui/icons/Icon";
import { Button } from "@/components/ui/primitives/Button";

import { relatedMap } from "../relationships";
import type { DemoPage } from "../types";

export const uiHelpersDemoPage: DemoPage = {
	id: "ui-helpers",
	slug: ["ui", "helpers"],
	title: "UI Helpers",
	description: "Utilities and helpers",
	groups: [
		{
			id: "ui-helpers-core",
			title: "Helpers",
			description: "Composable helpers",
			items: [
				{
					id: "icon-swap",
					kind: "component",
					name: "IconSwap",
					label: "Animated icon swap",
					related: relatedMap.IconSwap,
					Render() {
						const [iconSwapIndex, setIconSwapIndex] = useState(0);

						return (
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-3">
									<IconSwap
										size="sm"
										items={[
											{ icon: <Icon name="eye" /> },
											{ icon: <Icon name="eye-closed" /> },
										]}
										activeIndex={iconSwapIndex}
									/>
									<IconSwap
										size="md"
										items={[
											{ icon: <Icon name="eye" /> },
											{ icon: <Icon name="eye-closed" /> },
										]}
										activeIndex={iconSwapIndex}
									/>
									<IconSwap
										size="lg"
										items={[
											{ icon: <Icon name="eye" /> },
											{ icon: <Icon name="eye-closed" /> },
										]}
										activeIndex={iconSwapIndex}
									/>
								</div>
								<Button
									size="sm"
									variant="secondary"
									onClick={() => setIconSwapIndex((i) => (i === 0 ? 1 : 0))}
								>
									Toggle
								</Button>
							</div>
						);
					},
				},
			],
		},
	],
};
