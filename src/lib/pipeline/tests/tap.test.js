const { tap } = require("../tap");

describe("pipeline lib tap step", () => {
	const value = 10;
	const localContext = { foo: "bar" };
	const globalContext = { bar: "foo" };

	test("return the same value", () => {
		const fn = jest.fn(x => x * 2);

		const result = tap(fn)(value, localContext, globalContext);

		expect(result).toBe(value);
		expect(fn).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(fn).not.toHaveReturnedWith(value);
	});

	test("work with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const result = tap(fn)(value, localContext, globalContext);

		expect(result).resolves.toBe(value);
		expect(fn).toHaveBeenCalledWith(value, localContext, globalContext);
	});
});
