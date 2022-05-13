import { Collection } from "discord.js";
import { Context } from "../../types/Context";
import { Command } from "./discord";

declare module "discord.js" {
	interface Client {
		commands: Collection<string, Command>;

		setupHandlers(context: Context): Promise<void>;

		start(): Promise<void>;
	}
}
