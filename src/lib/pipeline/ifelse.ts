import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function ifelse<Value, Next, Context, Global>(
	condition: Pipeline.Pipeline<
		Value,
		boolean | Promise<boolean>,
		Context,
		Global
	>,
	then: Pipeline.Pipeline<Value, Next, Context, Global>,
	otherwise: Pipeline.Pipeline<Value, Next, Context, Global> = value =>
		value as any
) {
	return ((...args) => {
		const result = condition(...args);

		if (isPromise(result)) {
			return result.then(b => (b ? then(...args) : otherwise(...args)));
		}

		return result ? then(...args) : otherwise(...args);
	}) as Pipeline.Pipeline<Value, Next, Context, Global>;
}
