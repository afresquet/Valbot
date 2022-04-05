import { SlashCommandBuilder } from "@discordjs/builders";
import {
	Awaitable,
	Client,
	ClientEvents,
	CommandInteraction,
} from "discord.js";

export type Handler = (client: Client) => void | Promise<void>;

export type Event<T extends keyof ClientEvents> = (
	client: Client
) => (...args: ClientEvents[T]) => Awaitable<void>;

export interface Command {
	data: SlashCommandBuilder;
	execute(
		interaction: CommandInteraction,
		client: Client
	): void | Promise<void>;
}
