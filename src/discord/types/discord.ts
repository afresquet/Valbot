import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { ClientEvents } from "discord.js";
import { Context } from "../../types/Context";
import { DiscordEventPipeline } from "../lib/discord-event-pipeline";

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
	execute: DiscordEventPipeline.Pipeline<T, ClientEventsContext[T], void>;
}

export interface Command {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	execute: DiscordEventPipeline.CommandInteraction.Pipeline;
}
