import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { assistantAdapters } from "@/lib/assistant/server";

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ fileId: string }> },
) {
	const access = await resolveAssistantActor();
	if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
	const result = await assistantAdapters.files.getAccessUrl(
		access.actor,
		(await params).fileId,
	);
	return result
		? Response.json(result)
		: Response.json({ error: "File not found." }, { status: 404 });
}
