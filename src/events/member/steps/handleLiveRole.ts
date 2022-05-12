import { Role } from "discord.js";
import { Pipeline } from "../../../lib/pipeline/pipeline";
import { match } from "../../../lib/pipeline/steps/match";
import { ClientEventsContext } from "../../../types/discord";

export const handleLiveRole: Pipeline.Step<
	{ role: Role; hasLiveRole: boolean; isStreaming: boolean },
	void,
	ClientEventsContext["presenceUpdate"]
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
