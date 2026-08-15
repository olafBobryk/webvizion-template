const payloadDisabledResponse = () =>
	new Response(
		"Payload API routes are scaffolded but disabled in this template version. See docs/operations/payload-vercel-neon-blob.md.",
		{
			status: 404,
			headers: {
				"content-type": "text/plain; charset=utf-8",
			},
		},
	);

export const DELETE = payloadDisabledResponse;
export const GET = payloadDisabledResponse;
export const OPTIONS = payloadDisabledResponse;
export const PATCH = payloadDisabledResponse;
export const POST = payloadDisabledResponse;
export const PUT = payloadDisabledResponse;
