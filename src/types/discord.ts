import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { Client, ClientEvents } from "discord.js";
import { InteractionPipeline } from "../lib/custom-pipelines/command/interaction-pipeline";
import { DiscordEventPipeline } from "../lib/custom-pipelines/discord-event/discord-event-pipeline";

export type Handler = (client: Client) => void | Promise<void>;

export interface ClientEventsContext {
	interactionCreate: {
		interaction: ClientEvents["interactionCreate"][0];
	};

	presenceUpdate: {
		oldPresence: ClientEvents["presenceUpdate"][0];
		newPresence: ClientEvents["presenceUpdate"][1];
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
	execute: InteractionPipeline.Pipeline<void | Promise<void>>;
}
