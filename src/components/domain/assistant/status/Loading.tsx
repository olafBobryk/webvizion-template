import { Loader } from "@/components/ui/misc";
import { StatusFrame } from "./StatusFrame";

export function Loading() {
	return (
		<StatusFrame>
			<Loader aria-hidden size="sm" />
			<span className="sr-only">Waiting for Assistant</span>
		</StatusFrame>
	);
}
