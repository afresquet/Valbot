const { skipSelf } = require("../steps/skipSelf");

describe("skipSelf step", () => {
	test("throws ExitError if it's itself", () => {
		const event = { self: true };

		const fn = () => skipSelf({}, event, {});

		expect(fn).toThrow("ExitError");
	});

	test("continues if it's not itself", () => {
		const value = "value";
		const event = { self: false };

		const result = skipSelf(value, event, {});

		expect(result).toBe(value);
	});
});
