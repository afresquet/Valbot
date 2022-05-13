const { ifelse } = require("../ifelse");

describe("pipeline lib ifelse step", () => {
	const value = 10;
	const localContext = { foo: "bar" };
	const globalContext = { foo: "bar" };

	test("calls the first function if the condition is true", () => {
		const condition = jest.fn(x => x > 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const result = ifelse(condition, then, otherwise)(
			value,
			localContext,
			globalContext
		);

		expect(result).toBe(20);
		expect(condition).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(then).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(otherwise).not.toHaveBeenCalled();
	});

	test("calls the second function if the condition is false", () => {
		const condition = jest.fn(x => x < 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const result = ifelse(condition, then, otherwise)(
			value,
			localContext,
			globalContext
		);

		expect(result).toBe(5);
		expect(condition).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(then).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, localContext, globalContext);
	});

	test("returns the same value if the condition is false and no 'otherwise' function is passed", () => {
		const condition = jest.fn(x => x < 5);
		const then = jest.fn(x => x * 2);

		const result = ifelse(condition, then)(value, localContext, globalContext);

		expect(result).toBe(value);
		expect(condition).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(then).not.toHaveBeenCalled();
	});

	test("works with promises for true condition", async () => {
		const condition = jest.fn(async x => x > 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const result = await ifelse(condition, then, otherwise)(
			value,
			localContext,
			globalContext
		);

		expect(result).toBe(20);
		expect(condition).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(then).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(otherwise).not.toHaveBeenCalled();
	});

	test("works with promises for false condition", async () => {
		const condition = jest.fn(async x => x < 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const result = await ifelse(condition, then, otherwise)(
			value,
			localContext,
			globalContext
		);

		expect(result).toBe(5);
		expect(condition).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(then).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, localContext, globalContext);
	});
});
