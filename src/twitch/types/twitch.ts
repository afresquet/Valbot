import type { Events } from "tmi.js";
import { Context } from "../../types/Context";
import { TwitchEventPipeline } from "../lib/twitch-event-pipeline";

export type Handler = (context: Context) => void | Promise<void>;

export interface ClientEventsContext {
	connected: {
		address: Parameters<Events["connected"]>[0];
		port: Parameters<Events["connected"]>[1];
	};

	message: {
		channel: Parameters<Events["message"]>[0];
		userstate: Parameters<Events["message"]>[1];
		message: Parameters<Events["message"]>[2];
		self: Parameters<Events["message"]>[3];
	};
}

export interface Event<T extends keyof ClientEventsContext> {
	name: string;
	event: T;
	once?: boolean;
	execute: TwitchEventPipeline.Pipeline<T, void>;
}

export interface Command {
	name: string;
	subcommand?: string;
	once?: boolean;
	execute: TwitchEventPipeline.Command.Pipeline;
}
