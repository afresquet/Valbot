import DiscordPipeline from "../../../lib";
import { Event } from "../../../types/discord";
import {
	guildMemberHasActivity,
	guildMemberHasRole,
} from "../../../utils/guildMembers";
import { getRole } from "../steps/getRole";
import { handleLiveRole } from "../steps/handleLiveRole";

const liveRoleUpdateEvent: Event<"presenceUpdate"> = {
	name: "live-role",
	event: "presenceUpdate",
	execute: new DiscordPipeline<"presenceUpdate">()
		.pipe(getRole)
		.assert((_, __, { Errors }) => new Errors.Exit())
		.context((role, { newPresence, ...context }) => ({
			...context,
			newPresence,
			hasLiveRole: guildMemberHasRole(newPresence.member!, role),
			isStreaming: guildMemberHasActivity(newPresence.member!, "STREAMING"),
		}))
		.match(handleLiveRole)
		.compose(),
};

export default liveRoleUpdateEvent;
