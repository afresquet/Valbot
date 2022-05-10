import { LiveRoleModel } from "../../schemas/LiveRole";
import type { Event } from "../../types/discord";
import {
	guildMemberHasActivity,
	guildMemberHasRole,
} from "../../utils/guildMembers";

const liveRoleUpdateEvent: Event<"presenceUpdate"> = {
	name: "live-role",
	event: "presenceUpdate",
	execute: async (_, newPresence) => {
		const liveRole = await LiveRoleModel.findRoleByGuild(newPresence.guild!);

		if (!liveRole) return;

		const hasLiveRole = guildMemberHasRole(newPresence.member!, liveRole);
		const isStreaming = guildMemberHasActivity(
			newPresence.member!,
			"STREAMING"
		);

		if (!hasLiveRole && isStreaming) {
			await newPresence.member!.roles.add(liveRole);
		} else if (hasLiveRole && !isStreaming) {
			await newPresence.member!.roles.remove(liveRole);
		}
	},
};

export default liveRoleUpdateEvent;
