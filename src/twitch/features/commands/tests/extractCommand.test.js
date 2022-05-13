const { extractCommand } = require("../steps/extractCommand");

describe("extractCommand step", () => {
	const context = { channel: "#channel" };

	test("extracts the command removing the prefix", () => {
		const value = ["foo", "bar", "!command", "command message"];

		const result = extractCommand(value, context);

		expect(result).toStrictEqual({
			channel: context.channel,
			name: "command",
			message: "command message",
		});
	});

	test("extracts the command without prefix", () => {
		const value = ["foo", "bar", "command", "command message"];

		const result = extractCommand(value, context);

		expect(result).toStrictEqual({
			channel: context.channel,
			name: "command",
			message: "command message",
		});
	});
});
