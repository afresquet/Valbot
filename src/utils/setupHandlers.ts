import { Client } from "discord.js";
import { ExtendedClient } from "tmi.js";
import { Context } from "../types/Context";

export const setupHandlers = async (
	context: Context,
	...clients: (Client | ExtendedClient)[]
) => {
	await Promise.all(clients.map(client => client.setupHandlers(context)));
};
