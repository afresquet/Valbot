import type { Events, ExtendedClient } from "tmi.js";

export type Handler = (client: ExtendedClient) => void | Promise<void>;

export interface Event<T extends keyof Events> {
	name: string;
	event: T;
	once?: boolean;
	execute: (client: ExtendedClient) => Events[T];
}

export interface Command {
	name: string;
	once?: boolean;
	execute: (client: ExtendedClient) => Events["message"];
}
