import { Role } from "discord.js";
import { match } from "../../../../lib/pipeline";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";

export const handleLiveRole: DiscordEventPipeline.Pipeline<
	"presenceUpdate",
	{ role: Role; hasLiveRole: boolean; isStreaming: boolean },
	Promise<void>
> = match(m =>
	m
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
);
