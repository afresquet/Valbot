const { tap } = require("../../../../src/lib/pipeline/steps/tap");

describe("pipeline lib tap step", () => {
	const value = 10;
	const context = { foo: "bar" };

	test("should return the same value", () => {
		const fn = jest.fn(x => x * 2);

		const result = tap(fn)(value, context);

		expect(result).toBe(value);
		expect(fn).toHaveBeenCalledWith(value, context);
		expect(fn).not.toHaveReturnedWith(value);
	});

	test("should work with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const result = tap(fn)(value, context);

		expect(result).resolves.toBe(value);
		expect(fn).toHaveBeenCalledWith(value, context);
	});
});
