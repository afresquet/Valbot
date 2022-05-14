import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";

export const splitString =
	(
		amount?: number
	): TwitchEventPipeline.Pipeline<"message", string, string[]> =>
	string => {
		const words = string.split(/\s+/g);

		if (!amount) return words.map(word => word.toLowerCase());

		const args = words.slice(0, amount).map(word => word.toLowerCase());
		const rest = words.slice(amount).join(" ");

		return [...args, rest];
	};
