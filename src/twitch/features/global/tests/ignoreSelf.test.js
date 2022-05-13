const { Errors } = require("../../../../utils/Errors");
const { TwitchErrors } = require("../../../utils/TwitchErrors");
const { ignoreSelf } = require("../steps/ignoreSelf");

describe("ignoreSelf step", () => {
	test("throws ExitError if it's itself", () => {
		const event = { self: true };

		const fn = () => ignoreSelf({}, event, {});

		expect(fn).toThrow(TwitchErrors.Exit);
	});

	test("continues if it's not itself", () => {
		const value = "value";
		const event = { self: false };

		const result = ignoreSelf(value, event, {});

		expect(result).toBe(value);
	});
});
