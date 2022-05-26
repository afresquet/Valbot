const { Errors } = require("../../../../utils/Errors");
const { checkPrefix } = require("../steps/checkPrefix");

describe("checkPrefix step", () => {
	const value = "value";
	const prefix = "!";
	const message = "command test";

	const context = { Errors };

	test("returns the message without the prefix if the message starts with the prefix", () => {
		const event = { message: prefix + message };
		const result = checkPrefix(value, event, context);

		expect(result).toBe(message);
	});

	test("throws Exit error if the message doesn't start with the prefix", () => {
		const event = { message: "command" };

		const fn = () => checkPrefix(value, event, context);

		expect(fn).toThrowError(Errors.Exit);
	});
});
