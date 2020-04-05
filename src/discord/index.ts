import Discord from "discord.js";
import { discordEventErrorHandler } from "./helpers/discordEventErrorHandler";

const client = new Discord.Client();

client.on = discordEventErrorHandler(client);

export const discord = client;
