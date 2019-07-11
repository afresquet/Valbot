const dotenv = require("dotenv");
const createDiscordClient = require("./discord");
const isProduction = require("./helpers/isProduction");

dotenv.config();

const client = createDiscordClient();

const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;
client.login(isProduction ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);
