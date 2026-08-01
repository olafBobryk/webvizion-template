"use client";

import { memo } from "react";
import * as Markdown from "@/components/composites/markdown";

export const Response = memo(function AssistantResponse({
	streaming = false,
	text,
}: {
	streaming?: boolean;
	text: string;
}) {
	return (
		<Markdown.Render
			density="compact"
			markdown={text}
			streaming={streaming}
			variant="result"
		/>
	);
});
