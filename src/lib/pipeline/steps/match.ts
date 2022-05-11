import { Pipeline } from "../pipeline";

interface Match<T, R, C> {
	run(value: T, context: C): R | Promise<R>;

	on(
		matcher: (value: T, context: C) => boolean | Promise<boolean>,
		pipeline?: Pipeline.Step<T, R, C>
	): Match<T, R, C>;

	otherwise(pipeline: Pipeline.Step<T, R, C>): Match<T, R, C>;
}

class MatchBuilder<T, R, C> implements Match<T, R, C> {
	private matchers: {
		matcher: Pipeline.Step<T, boolean, C>;
		pipeline: Pipeline.Step<T, R, C>;
	}[] = [];

	private otherwisePipeline?: Pipeline.Step<T, R, C>;

	run(value: T, context: C): R | Promise<R> {
		for (const { matcher, pipeline } of this.matchers) {
			if (matcher(value, context) && pipeline) {
				return pipeline(value, context);
			}
		}

		if (!this.otherwisePipeline) {
			throw new Error("No 'otherwise' pipeline defined for unmatched value");
		}

		return this.otherwisePipeline(value, context);
	}

	on(matcher: Pipeline.Step<T, boolean, C>, pipeline?: Pipeline.Step<T, R, C>) {
		if (pipeline) {
			this.matchers.push({ matcher, pipeline });
		}

		return this;
	}

	otherwise(pipeline: Pipeline.Step<T, R, C>) {
		this.otherwisePipeline = pipeline;

		return this;
	}
}

export function match<R, T, C>(
	matchFn: (m: Match<T, R, C>) => void
): Pipeline.Step<T, R, C> {
	const builder = new MatchBuilder<T, R, C>();

	matchFn(builder);

	return builder.run.bind(builder);
}
