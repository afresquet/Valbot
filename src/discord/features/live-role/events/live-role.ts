import { assert } from "../../../../lib/pipeline";
import DiscordEventPipelineBuilder from "../../../lib/discord-event-pipeline";
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
	execute: new DiscordEventPipelineBuilder<"presenceUpdate">()
		.pipe(getRole)
		.pipe(assert())
		.pipe((role, { newPresence }) => ({
			role,
			hasLiveRole: guildMemberHasRole(newPresence.member!, role),
			isStreaming: guildMemberHasActivity(newPresence.member!, "STREAMING"),
		}))
		.pipe(handleLiveRole)
		.build(),
};

export default liveRoleUpdateEvent;