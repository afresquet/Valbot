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
		const configuration = await LiveRoleModel.findOne({
			guildId: newPresence.guild?.id,
		});

		if (!configuration) return;

		const liveRole = newPresence.guild?.roles.cache.find(
			role => role.id === configuration.roleId
		);

		if (!liveRole) return;

		const hasLiveRole = guildMemberHasRole(newPresence.member!, liveRole);
		const isStreaming = guildMemberHasActivity(
			newPresence.member!,
			"STREAMING"
		);

		if (!hasLiveRole && isStreaming) {
			await newPresence.member?.roles.add(liveRole);
		} else if (hasLiveRole && !isStreaming) {
			await newPresence.member?.roles.remove(liveRole);
		}
	},
};

export default liveRoleUpdateEvent;
