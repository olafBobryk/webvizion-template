import { StatusMessagePresence } from "./StatusMessagePresence";
import { StatusMessageSurface } from "./StatusMessageSurface";

export type {
	StatusMessagePresenceGap,
	StatusMessagePresenceProps,
} from "./StatusMessagePresence";
export type {
	StatusMessageProps,
	StatusMessageTone,
} from "./StatusMessageSurface";

export const StatusMessage = Object.assign(StatusMessageSurface, {
	Presence: StatusMessagePresence,
});
