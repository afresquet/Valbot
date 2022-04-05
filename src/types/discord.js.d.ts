import { Collection } from "discord.js";

declare module "discord.js" {
	interface Client {
		commands: Collection<string, string>;
		aliases: Collection<string, string>;
	}
}
