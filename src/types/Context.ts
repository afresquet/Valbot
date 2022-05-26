import { Client } from "discord.js";
import { Mongoose } from "mongoose";
import { ExtendedClient } from "tmi.js";
import { Errors } from "../utils/Errors";

export interface Context {
	discord: Client;
	twitch: ExtendedClient;
	db: Mongoose;
	Errors: typeof Errors;
}
