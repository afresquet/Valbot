import {
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import { Awaitable, Client, ClientEvents } from "discord.js";
import { InteractionPipeline } from "../lib/custom-pipelines/command/interaction-pipeline";

export type Handler = (client: Client) => void | Promise<void>;

export interface Event<T extends keyof ClientEvents> {
	name: string;
	event: T;
	once?: boolean;
	execute: (...args: ClientEvents[T]) => Awaitable<void>;
}

export interface Command {
	data:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
	execute: InteractionPipeline.Pipeline<void | Promise<void>>;
}
