const { pairwise } = require("../pairwise");

describe("pipeline lib pairwise step", () => {
	const value = 10;
	const localContext = { foo: "bar" };
	const globalContext = { bar: "foo" };

	test("returns both the previous and new value", () => {
		const fn = jest.fn(x => x * 2);

		const result = pairwise(fn)(value, localContext, globalContext);

		expect(result).toStrictEqual([value, 20]);
		expect(fn).toHaveBeenCalledWith(value, localContext, globalContext);
	});

	test("works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const result = pairwise(fn)(value, localContext, globalContext);

		expect(result).resolves.toStrictEqual([value, 20]);
		expect(fn).toHaveBeenCalledWith(value, localContext, globalContext);
	});
});
