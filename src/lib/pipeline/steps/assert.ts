import type { Pipeline } from "../pipeline";
import { tap } from "./tap";

export function assert<T, C>(
	throwable?: Pipeline.Step<T, any, C>
): Pipeline.Step<T, NonNullable<T>, C> {
	return tap<T, C>((value, context) => {
		if (value === undefined || value === null) {
			// TODO: change error to ExitError
			throw (
				throwable?.(value, context) ?? new Error("value is null or undefined")
			);
		}
	}) as unknown as Pipeline.Step<T, NonNullable<T>, C>;
}
