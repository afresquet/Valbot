import Discord from "discord.js";
import { discordEventErrorHandler } from "./tools/discordEventErrorHandler";

const client = new Discord.Client();

client.on = discordEventErrorHandler(client);

export const discord = client;
