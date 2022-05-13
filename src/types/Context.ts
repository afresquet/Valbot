import { Client } from "discord.js";
import { Mongoose } from "mongoose";
import { ExtendedClient } from "tmi.js";

export interface Context {
	discord: Client;
	twitch: ExtendedClient;
	db: Mongoose;
}
