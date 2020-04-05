import { createQuote } from "../../firebase/quotes/createQuote";
import { fetchQuote } from "../../firebase/quotes/fetchQuote";
import { removeQuote } from "../../firebase/quotes/removeQuote";
import { prefixCommand } from "../../helpers/prefixString";
import { TwitchFeature } from "../../types/Feature";
import { Months } from "../../types/Months";
import { isMod } from "../helpers/isMod";
import { messageSplitter } from "../helpers/messageSplitter";

const addQuoteRegex = /^"(.+)" -((?:\b(?!(?:January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sep|October|Oct|November|Nov|December|Dec|\d{4})\b)\w+\s*)+)/i;

export const quotes: TwitchFeature = twitch => {
	twitch.on("message", async (channel, userstate, message, self) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const [command, action, quote] = messageSplitter(message, 2);

		if (command !== prefixCommand("quote")) return;

		const missingArgumentsMessage = `@${userstate.username}, missing/invalid arguments, use "!quote help".`;

		switch (action) {
			case "add":
			case "create": {
				if (!isMod(channel, userstate)) return;

				if (!quote) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				if (!addQuoteRegex.test(quote)) {
					await twitch.say(
						channel,
						`@${userstate.username}, invalid syntax, use "!quote help ${action}".`
					);

					break;
				}

				const [, message, author] = addQuoteRegex.exec(quote)!;

				const number = await createQuote(message, author);

				await twitch.say(channel, `Quote #${number} was created!`);

				break;
			}

			case "delete":
			case "remove": {
				if (!isMod(channel, userstate)) return;

				if (!quote) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				const deleted = await removeQuote(quote);

				if (!deleted) break;

				await twitch.say(channel, `Quote #${quote} was successfully deleted!`);

				break;
			}

			case "help": {
				if (quote === "add" || quote === "create") {
					await twitch.say(
						channel,
						`@${userstate.username}, the syntax for the quote to be added should be like this (month and year are not necessary): "Text in between double quotes" -Author`
					);

					break;
				}

				await twitch.say(
					channel,
					`@${userstate.username}, !quote - For a random quote; !quote <number>; !quote <action> <quote | number> - Available <actions> are "add" and "remove".`
				);

				break;
			}

			default: {
				if (action !== "" && Number.isNaN(parseInt(action, 10))) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				const number = action === "" ? undefined : action;

				const quoteObj = await fetchQuote(number);

				if (!quoteObj) break;

				const date = quoteObj.date.toDate();

				const month = Months[date.getMonth()];

				const year = date.getFullYear();

				await twitch.say(
					channel,
					`#${quoteObj.number}: "${quoteObj.quote}" -${quoteObj.author}, ${month} ${year}`
				);

				break;
			}
		}
	});
};
