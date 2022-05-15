import { Role } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";

export const handleLiveRole: DiscordEventPipeline.MatchFunction<
	"presenceUpdate",
	{ role: Role; hasLiveRole: boolean; isStreaming: boolean },
	Promise<void>
> = match =>
	match
		.on(
			({ hasLiveRole, isStreaming }) => !hasLiveRole && isStreaming,
			async ({ role }, { newPresence }) => {
				await newPresence.member!.roles.add(role);
			}
		)
		.on(
			({ hasLiveRole, isStreaming }) => hasLiveRole && !isStreaming,
			async ({ role }, { newPresence }) => {
				await newPresence.member!.roles.remove(role);
			}
		)
		.otherwise(() => {});
