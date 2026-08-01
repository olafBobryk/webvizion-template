import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { executeRecordTool } from "@/lib/assistant/records.server";

const previewTools = new Set([
	"record_update",
	"record_archive",
	"record_delete",
]);

export async function POST(request: Request) {
	const access = await resolveAssistantActor();
	if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
	if (!access.capabilities.has("records.write")) {
		return Response.json(
			{ error: "Record write access is required." },
			{ status: 403 },
		);
	}

	const body = (await request.json().catch(() => null)) as {
		input?: unknown;
		toolName?: unknown;
	} | null;
	if (
		!body ||
		typeof body.toolName !== "string" ||
		!previewTools.has(body.toolName)
	) {
		return Response.json(
			{ error: "Unsupported Record preview." },
			{ status: 400 },
		);
	}
	const input = body.input as Record<string, unknown> | null;
	if (!input || typeof input.id !== "string") {
		return Response.json(
			{ error: "A record id is required." },
			{ status: 400 },
		);
	}

	try {
		const result = await executeRecordTool(
			"record_get",
			{ id: input.id },
			{
				canWrite: false,
				organizationId: access.actor.organizationId,
			},
		);
		return Response.json(result);
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error ? error.message : "Record preview failed.",
			},
			{ status: 404 },
		);
	}
}
