import { Button } from "@/components/ui/primitives/Button";
import { Panel } from "@/components/ui/primitives/Panel";
import { Section } from "@/components/ui/primitives/Section";
import { Text } from "@/components/ui/primitives/Text";

export default function ContactPage() {
	return (
		<Section className="min-h-[70vh]" padding="default">
			<div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
				<div className="flex flex-col gap-3">
					<Text as="h1" variant="headingXl">
						Contact
					</Text>
					<Text as="p" variant="body" tone="muted">
						Replace this starter contact path with the channel and form your
						project needs.
					</Text>
				</div>
				<Panel display="flex" gap="sm" padding="md">
					<Text as="h2" variant="headingSm">
						Start a conversation
					</Text>
					<Text as="p" variant="support" tone="muted">
						The thin profile keeps this route intentionally simple and ready for
						a project-specific form or provider adapter.
					</Text>
					<div>
						<Button href="mailto:hello@example.com">Email us</Button>
					</div>
				</Panel>
			</div>
		</Section>
	);
}
