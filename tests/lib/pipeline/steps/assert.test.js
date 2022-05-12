const { assert } = require("../../../../src/lib/pipeline/steps/assert");

describe("pipeline lib tap assert", () => {
	const value = 10;
	const context = { foo: "bar" };

	const error = new Error("error");
	const fn = jest.fn(x => error);

	beforeEach(jest.clearAllMocks);
	test("asserts the value", () => {
		const result = assert(fn)(value, context);

		expect(result).toBe(value);
		expect(fn).not.toHaveBeenCalled();
	});

	test("throws if the value is undefined", () => {
		const cb = () => assert(fn)(undefined, context);

		expect(cb).toThrow(error);
		expect(fn).toHaveBeenCalled();
	});

	test("throws if the value is null", () => {
		const cb = () => assert(fn)(null, context);

		expect(cb).toThrow(error);
		expect(fn).toHaveBeenCalled();
	});

		test("throws default error if no throwable is provided", () => {
		const cb = () => assert()(undefined, context);

		expect(cb).toThrow("value is null or undefined");
		expect(fn).not.toHaveBeenCalled();
	});
});
