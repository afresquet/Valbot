"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = __importDefault(require("discord.js"));
require("dotenv/config");
const handlers_1 = require("./handlers");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
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
        yield (0, handlers_1.setupHandlers)(client);
        client.login(process.env.DISCORD_TOKEN).catch(console.error);
    });
}
run();
//# sourceMappingURL=index.js.map