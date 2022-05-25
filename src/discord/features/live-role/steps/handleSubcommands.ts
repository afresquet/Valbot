import { Role } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
import { ILiveRoleDocument } from "../schemas/LiveRole";
import { createLiveRoleConfiguration } from "./createConfiguration";
import { disableLiveRoleConfiguration } from "./disableConfiguration";
import { editLiveRoleConfiguration } from "./editConfiguration";

export const handleLiveRoleSubcommands: DiscordTypePipe.CommandInteraction.MatchFunction<
	Role | null,
	Promise<string>,
	{ configuration: ILiveRoleDocument | null }
> = match =>
	match
		.on(
			(role, { configuration }) => role !== null && configuration === null,
			createLiveRoleConfiguration
		)
		.on(
			(role, { configuration }) => role !== null && configuration !== null,
			editLiveRoleConfiguration
		)
		.on(
			(role, { configuration }) => role === null && configuration !== null,
			disableLiveRoleConfiguration
		)
		.otherwise(() => "Live role is not enabled on this server.");
