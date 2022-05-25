import { Collection } from "discord.js";
import { Context } from "../../types/Context";
import { Command, SetupCommand } from "./discord";

declare module "discord.js" {
	interface Client {
		commands: Collection<string, Command | SetupCommand>;

		setupHandlers(context: Context): Promise<void>;

		start(): Promise<void>;
	}
}
