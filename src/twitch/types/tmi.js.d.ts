import { Context } from "../../types/Context";
import { Command } from "./twitch";

declare module "tmi.js" {
	interface ExtendedClient extends Client {
		commands: Map<string, Command>;

		setupHandlers(context: Context): Promise<void>;

		start(): Promise<void>;
	}
}
