import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function tap<Value, Context, Global>(
	fn: Pipeline.Pipeline<Value, void, Context, Global>
): Pipeline.Pipeline<Value, Value, Context, Global> {
	return (value, context, global) => {
		const promise = fn(value, context, global);

		if (isPromise(promise)) {
			return promise.then(() => value);
		}

		return value;
	};
}
