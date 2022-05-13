const { splitString } = require("../steps/splitString");

describe("splitMessage step", () => {
	const value = "Command Add Test Command";

	test("splits the message into an array", () => {
		const result = splitString()(value);

		expect(result).toStrictEqual(["command", "add", "test", "command"]);
	});

	test("splits the message into an array with X amount of words", () => {
		const result = splitString(2)(value);

		expect(result).toStrictEqual(["command", "add", "Test Command"]);
	});
});
