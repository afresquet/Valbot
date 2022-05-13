import { Client } from "discord.js";
import { ExtendedClient } from "tmi.js";

export const startClients = async (...clients: (Client | ExtendedClient)[]) => {
	await Promise.all(clients.map(client => client.start()));
};
