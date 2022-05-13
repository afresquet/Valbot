import { Client } from "discord.js";
import { ExtendedClient } from "tmi.js";

export interface Context {
	discord: Client;
	twitch: ExtendedClient;
}
