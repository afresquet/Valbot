import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { Client, ClientEvents, CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../lib/custom-pipelines/discord-event/discord-event-pipeline";

export type Handler = (client: Client) => void | Promise<void>;

export interface ClientEventsContext {
	interactionCreate: {
		interaction: ClientEvents["interactionCreate"][0] | CommandInteraction;
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
	execute: DiscordEventPipeline.Pipeline<T, void>;
}

export interface Command {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	execute: DiscordEventPipeline.Pipeline<
		"interactionCreate",
		void | Promise<void>
	>;
}
