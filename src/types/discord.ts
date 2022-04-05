import { Awaitable, Client, ClientEvents } from "discord.js";

export type Handler = (client: Client) => void | Promise<void>;

export type Event<T extends keyof ClientEvents> = (
	client: Client
) => (...args: ClientEvents[T]) => Awaitable<void>;
