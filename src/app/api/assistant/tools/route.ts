import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { verifyAssistantApprovalId } from "@/lib/assistant/approval.server";
import { executeRecordTool } from "@/lib/assistant/records.server";
import {
	assistantAdapters,
	isAssistantToolName,
	isAssistantWriteTool,
} from "@/lib/assistant/server";

export async function POST(request: Request) {
	const access = await resolveAssistantActor();
	if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
	const body = (await request.json().catch(() => null)) as {
		approvalId?: unknown;
		approved?: unknown;
		messageId?: unknown;
		partId?: unknown;
		threadId?: unknown;
	} | null;
	if (
		!body ||
		typeof body.threadId !== "string" ||
		typeof body.messageId !== "string" ||
		typeof body.partId !== "string" ||
		typeof body.approvalId !== "string" ||
		typeof body.approved !== "boolean"
	) {
		return Response.json(
			{ error: "Invalid approval response." },
			{ status: 400 },
		);
	}
	const thread = await assistantAdapters.conversations.getThread(
		access.actor,
		body.threadId,
	);
	const message = thread?.messages.find(
		(candidate) => candidate.id === body.messageId,
	);
	const part = message?.parts.find((candidate) => candidate.id === body.partId);
	if (
		!thread ||
		!message ||
		part?.type !== "tool" ||
		!isAssistantToolName(part.name) ||
		!isAssistantWriteTool(part.name) ||
		part.state !== "approval-requested" ||
		part.approvalId !== body.approvalId
	) {
		return Response.json(
			{ error: "Approval is no longer actionable." },
			{ status: 409 },
		);
	}
	if (
		!verifyAssistantApprovalId(body.approvalId, {
			actor: access.actor,
			partId: part.id,
			threadId: thread.id,
			toolName: part.name,
		})
	) {
		return Response.json(
			{ error: "Approval signature is invalid." },
			{ status: 400 },
		);
	}
	if (!body.approved) {
		part.state = "denied";
		await assistantAdapters.conversations.replaceMessage(
			access.actor,
			thread.id,
			message,
		);
		return Response.json({ part });
	}
	if (!access.capabilities.has("records.write")) {
		return Response.json(
			{ error: "Record write access is required." },
			{ status: 403 },
		);
	}
	try {
		part.state = "approved";
		part.output = await executeRecordTool(part.name, part.input, {
			canWrite: true,
			organizationId: access.actor.organizationId,
		});
		part.state = "completed";
	} catch (error) {
		part.error = error instanceof Error ? error.message : "Record tool failed.";
		part.state = "error";
	}
	await assistantAdapters.conversations.replaceMessage(
		access.actor,
		thread.id,
		message,
	);
	return Response.json({ part });
}
