import dotenv from "dotenv";
import createDiscordClient from "./discord";

dotenv.config();

const prod = process.env.ENV === "production";

const client = createDiscordClient(prod);

const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;
client.login(prod ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);
