import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { ClientEvents } from "discord.js";
import { Context } from "../../types/Context";
import { DiscordTypePipe } from "../lib";

export type Handler = (context: Context) => void | Promise<void>;

export interface ClientEventsContext {
	interactionCreate: {
		interaction: ClientEvents["interactionCreate"][0];
	};

	presenceUpdate: {
		oldPresence: ClientEvents["presenceUpdate"][0];
		newPresence: ClientEvents["presenceUpdate"][1];
	};

	ready: {
		client: ClientEvents["ready"][0];
	};
}

export interface Event<T extends keyof ClientEventsContext> {
	name: string;
	event: T;
	once?: boolean;
	execute: DiscordTypePipe.Function<T, ClientEventsContext[T], void>;
}

export interface Command {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	execute: DiscordTypePipe.CommandInteraction.Function;
}
