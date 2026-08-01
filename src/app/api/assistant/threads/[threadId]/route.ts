import { NextResponse } from "next/server";
import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { assistantAdapters } from "@/lib/assistant/server";

type Context = { params: Promise<{ threadId: string }> };

export async function GET(_request: Request, context: Context) {
	const access = await resolveAssistantActor();
	if (!access) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const thread = await assistantAdapters.conversations.getThread(
		access.actor,
		(await context.params).threadId,
	);
	return thread
		? NextResponse.json({ thread })
		: NextResponse.json({ error: "Conversation not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: Context) {
	const access = await resolveAssistantActor();
	if (!access) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const body = (await request.json().catch(() => ({}))) as {
		pinned?: unknown;
		title?: unknown;
	};
	const patch = {
		...(typeof body.pinned === "boolean" ? { pinned: body.pinned } : {}),
		...(typeof body.title === "string" ? { title: body.title } : {}),
	};
	const thread = await assistantAdapters.conversations.updateThread(
		access.actor,
		(await context.params).threadId,
		patch,
	);
	return thread
		? NextResponse.json({ thread })
		: NextResponse.json({ error: "Conversation not found" }, { status: 404 });
}

export async function DELETE(_request: Request, context: Context) {
	const access = await resolveAssistantActor();
	if (!access) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const deleted = await assistantAdapters.conversations.deleteThread(
		access.actor,
		(await context.params).threadId,
	);
	return deleted
		? new NextResponse(null, { status: 204 })
		: NextResponse.json({ error: "Conversation not found" }, { status: 404 });
}
