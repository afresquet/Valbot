import { SlashCommandBuilder } from "@discordjs/builders";
import {
	Awaitable,
	Client,
	ClientEvents,
	CommandInteraction,
} from "discord.js";

export type Handler = (client: Client) => void | Promise<void>;

export interface Event<T extends keyof ClientEvents> {
	name: string;
	event: T;
	once?: boolean;
	execute: (...args: ClientEvents[T]) => Awaitable<void>;
}

export interface Command {
	data: SlashCommandBuilder;
	execute(interaction: CommandInteraction): void | Promise<void>;
}
