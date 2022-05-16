import { Role } from "discord.js";
import { TypePipe } from "typepipe";
import { Context } from "../../../../types/Context";
import { ClientEventsContext } from "../../../types/discord";

export const handleLiveRole: TypePipe.MatchFunction<
	Role,
	void,
	ClientEventsContext["presenceUpdate"] & {
		hasLiveRole: boolean;
		isStreaming: boolean;
	},
	Context
> = match =>
	match
		.on(
			(_, { hasLiveRole, isStreaming }) => !hasLiveRole && isStreaming,
			async (role, { newPresence }) => {
				await newPresence.member!.roles.add(role);
			}
		)
		.on(
			(_, { hasLiveRole, isStreaming }) => hasLiveRole && !isStreaming,
			async (role, { newPresence }) => {
				await newPresence.member!.roles.remove(role);
			}
		)
		.otherwise(() => {});
