import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/surfaces";

function ToolApprovalActionsRoot({
	destructive = false,
	disabled = false,
	onApprove,
	onDeny,
}: {
	destructive?: boolean;
	disabled?: boolean;
	onApprove?: () => void;
	onDeny?: () => void;
}) {
	return (
		<Card.Footer className="justify-end gap-2">
			<Button disabled={disabled} onClick={onDeny} size="sm" variant="ghost">
				Decline
			</Button>
			<Button
				disabled={disabled}
				onClick={onApprove}
				size="sm"
				tone={destructive ? "danger" : "default"}
				variant="primary"
			>
				{destructive ? "Delete permanently" : "Approve"}
			</Button>
		</Card.Footer>
	);
}

function ToolApprovalActionsSkeleton({
	destructive = false,
}: {
	destructive?: boolean;
}) {
	return (
		<Card.Footer className="justify-end gap-2">
			<Button.Skeleton size="sm" variant="ghost">
				Decline
			</Button.Skeleton>
			<Button.Skeleton size="sm" variant="primary">
				{destructive ? "Delete permanently" : "Approve"}
			</Button.Skeleton>
		</Card.Footer>
	);
}

export const ToolApprovalActions = Object.assign(ToolApprovalActionsRoot, {
	Skeleton: ToolApprovalActionsSkeleton,
});
