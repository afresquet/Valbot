import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function pairwise<Value, Next, Context, Global>(
	fn: Pipeline.Pipeline<Value, Next, Context, Global>
) {
	return ((value: Value, context: Context, global: Global) => {
		const result = fn(value, context, global);

		if (isPromise(result)) {
			return result.then(r => [value, r]);
		}

		return [value, result];
	}) as Pipeline.Pipeline<Value, [Value, Next], Context, Global>;
}
