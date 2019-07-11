import dotenv from "dotenv";
import createDiscordClient from "./discord";
import isProduction from "./helpers/isProduction";

dotenv.config();

const client = createDiscordClient();

const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;
client.login(isProduction ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);
