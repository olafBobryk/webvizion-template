import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { AssistantActor, AssistantToolName } from "./contracts";

declare global {
	var __averloAssistantApprovalSecret: string | undefined;
}

function secret() {
	globalThis.__averloAssistantApprovalSecret ??=
		process.env.ASSISTANT_TOOL_APPROVAL_SECRET ??
		randomBytes(32).toString("hex");
	return globalThis.__averloAssistantApprovalSecret;
}

function signature(payload: string) {
	return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createAssistantApprovalId(input: {
	actor: AssistantActor;
	partId: string;
	threadId: string;
	toolName: AssistantToolName;
}) {
	const payload = Buffer.from(JSON.stringify(input)).toString("base64url");
	return `${payload}.${signature(payload)}`;
}

export function verifyAssistantApprovalId(
	approvalId: string,
	expected: {
		actor: AssistantActor;
		partId: string;
		threadId: string;
		toolName: AssistantToolName;
	},
) {
	const [payload, suppliedSignature] = approvalId.split(".");
	if (!payload || !suppliedSignature) return false;
	const calculated = signature(payload);
	const left = Buffer.from(calculated);
	const right = Buffer.from(suppliedSignature);
	if (left.length !== right.length || !timingSafeEqual(left, right))
		return false;
	try {
		return (
			JSON.stringify(
				JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
			) === JSON.stringify(expected)
		);
	} catch {
		return false;
	}
}
