import type { Pipeline } from "../pipeline";
import { tap } from "./tap";

export function assert<T, C>(
	throwable: Pipeline.Step<T, any, C>
): Pipeline.Step<T, NonNullable<T>, C> {
	return tap<T, C>((value, context) => {
		if (value === undefined || value === null) {
			throw throwable(value, context);
		}
	}) as unknown as Pipeline.Step<T, NonNullable<T>, C>;
}
