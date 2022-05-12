import { Command } from "./twitch";

declare module "tmi.js" {
	interface ExtendedClient extends Client {
		commands: Map<string, Command>;
	}
}
