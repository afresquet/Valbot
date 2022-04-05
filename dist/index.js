"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
require("dotenv/config");
const client = new discord_js_1.default.Client({
    restTimeOffset: 0,
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: [
        discord_js_1.default.Intents.FLAGS.GUILDS,
        discord_js_1.default.Intents.FLAGS.GUILD_MEMBERS,
        discord_js_1.default.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.default.Intents.FLAGS.GUILD_VOICE_STATES,
        discord_js_1.default.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord_js_1.default.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    ],
});
client.commands = new discord_js_1.default.Collection();
client.aliases = new discord_js_1.default.Collection();
client.login(process.env.DISCORD_TOKEN).catch(console.error);
//# sourceMappingURL=index.js.map