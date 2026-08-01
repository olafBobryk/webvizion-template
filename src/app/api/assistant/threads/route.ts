import { NextResponse } from "next/server";
import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { assistantAdapters } from "@/lib/assistant/server";

export async function GET() {
	const access = await resolveAssistantActor();
	if (!access) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const threads = await assistantAdapters.conversations.listThreads(
		access.actor,
	);
	return NextResponse.json({ threads });
}

export async function POST(request: Request) {
	const access = await resolveAssistantActor();
	if (!access) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const input = (await request.json().catch(() => ({}))) as { title?: unknown };
	const title = typeof input.title === "string" ? input.title : undefined;
	const thread = await assistantAdapters.conversations.createThread(
		access.actor,
		title,
	);
	return NextResponse.json({ thread }, { status: 201 });
}
