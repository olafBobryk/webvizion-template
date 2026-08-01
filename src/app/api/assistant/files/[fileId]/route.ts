import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { verifyFileAccess } from "@/lib/assistant/fixture";
import { assistantAdapters } from "@/lib/assistant/server";

type Context = { params: Promise<{ fileId: string }> };

export async function GET(request: Request, context: Context) {
	const access = await resolveAssistantActor();
	if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
	const { fileId } = await context.params;
	const url = new URL(request.url);
	const expires = Number(url.searchParams.get("expires"));
	const token = url.searchParams.get("token") ?? "";
	if (!verifyFileAccess(access.actor, fileId, expires, token)) {
		return Response.json({ error: "File link expired." }, { status: 403 });
	}
	const stored = await assistantAdapters.files.get(access.actor, fileId);
	if (!stored)
		return Response.json({ error: "File not found." }, { status: 404 });
	return new Response(stored.bytes.slice().buffer as ArrayBuffer, {
		headers: {
			"Cache-Control": "private, no-store",
			"Content-Disposition": `inline; filename="${stored.attachment.filename.replaceAll('"', "")}"`,
			"Content-Type": stored.attachment.contentType,
		},
	});
}

export async function DELETE(_request: Request, context: Context) {
	const access = await resolveAssistantActor();
	if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
	return (await assistantAdapters.files.delete(
		access.actor,
		(
			await context.params
		).fileId,
	))
		? new Response(null, { status: 204 })
		: Response.json({ error: "File not found." }, { status: 404 });
}
