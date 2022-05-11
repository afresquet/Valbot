import { isPromise } from "util/types";
import type { Pipeline } from "../pipeline";

export function ifelse<T, R, C>(
	condition: Pipeline.Step<T, boolean, C>,
	then: Pipeline.Step<T, R, C>,
	otherwise: Pipeline.Step<T, R, C> = value => value as any
): Pipeline.Step<T, R, C> {
	return (...args) => {
		const result = condition(...args);

		if (isPromise(result)) {
			return (result as Promise<boolean>).then(b =>
				b ? then(...args) : otherwise(...args)
			);
		}

		return result ? then(...args) : otherwise(...args);
	};
}
