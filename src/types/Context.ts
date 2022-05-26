import { Client } from "discord.js";
import { Mongoose } from "mongoose";
import { ExtendedClient } from "tmi.js";
import { Errors } from "../utils/Errors";
import { Models } from "./Models";

export interface Context {
	discord: Client;
	twitch: ExtendedClient;
	db: Mongoose;
	models: Models;
	Errors: typeof Errors;
}
