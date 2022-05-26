const { Errors } = require("../../../../utils/Errors");
const { ignoreSelf } = require("../steps/ignoreSelf");

describe("ignoreSelf step", () => {
	const context = { Errors };

	test("throws ExitError if it's itself", () => {
		const event = { self: true };

		const fn = () => ignoreSelf({}, event, context);

		expect(fn).toThrow(Errors.Exit);
	});

	test("continues if it's not itself", () => {
		const value = "value";
		const event = { self: false };

		const fn = () => ignoreSelf(value, event, context);

		expect(fn).not.toThrow();
	});
});
