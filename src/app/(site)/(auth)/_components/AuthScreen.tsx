import { Icon, type IconName } from "@/components/ui/icons/Icon";
import { StatusMessage } from "@/components/ui/primitives/StatusMessage";
import { Card } from "@/components/ui/primitives/surfaces";
import {
	AuthDomainError,
	type AuthErrorCode,
	toPublicAuthError,
} from "@/lib/auth/errors";

type AuthScreenProps = {
	children: React.ReactNode;
	description: React.ReactNode;
	icon: IconName;
	message?: string;
	title: React.ReactNode;
};

const successMessages: Record<string, string> = {
	"password-reset": "Password reset. Sign in with your new password.",
};

function getMessage(message?: string) {
	if (!message || message === "signed-out") return null;
	if (successMessages[message]) {
		return { text: successMessages[message], tone: "success" as const };
	}
	const publicError = toPublicAuthError(
		new AuthDomainError(message as AuthErrorCode),
	);
	return { text: publicError.message, tone: "danger" as const };
}

export function AuthScreen({
	children,
	description,
	icon,
	message,
	title,
}: AuthScreenProps) {
	const status = getMessage(message);
	return (
		<Card className="w-full">
			<Card.Heading
				description={description}
				leading={
					<Icon className="text-muted-foreground" name={icon} size="sm" />
				}
				title={title}
				titleAs="h1"
			/>
			<Card.Content className="grid gap-4">
				{status ? (
					<StatusMessage tone={status.tone}>{status.text}</StatusMessage>
				) : null}
				{children}
			</Card.Content>
		</Card>
	);
}
