import { isPromise } from "util/types";
import type { Pipeline } from "../pipeline";

export function pairwise<T, R, C>(
	fn: Pipeline.Step<T, R, C>
): Pipeline.Step<T, [T, R], C> {
	return (value: T, context: C) => {
		const result = fn(value, context);

		if (isPromise(result)) {
			return (result as Promise<R>).then(r => [value, r]);
		}

		return [value, result as R];
	};
}
