import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function tap<T, C>(
	fn: Pipeline.Step<T, void | Promise<void>, C>
): Pipeline.Step<T, T, C> {
	return (value, context) => {
		const promise = fn(value, context);

		if (isPromise(promise)) {
			return promise.then(() => value);
		}

		return value;
	};
}
