import { NextResponse } from "next/server";
import { resolveAssistantActor } from "@/lib/assistant/access.server";
import { assistantAdapters } from "@/lib/assistant/server";

export async function POST(request: Request) {
	const access = await resolveAssistantActor();
	if (!access) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const file = (await request.formData()).get("file");
	if (!(file instanceof File)) {
		return NextResponse.json(
			{ error: "Choose a file to upload." },
			{ status: 400 },
		);
	}
	try {
		const attachment = await assistantAdapters.files.create(access.actor, file);
		const accessUrl = await assistantAdapters.files.getAccessUrl(
			access.actor,
			attachment.id,
		);
		if (!accessUrl) {
			await assistantAdapters.files.delete(access.actor, attachment.id);
			throw new Error("Could not prepare the file preview.");
		}
		return NextResponse.json(
			{ accessUrl: accessUrl.url, attachment },
			{ status: 201 },
		);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Upload failed." },
			{ status: 400 },
		);
	}
}
