import { Query } from "mongoose";
import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export default class PipelineBuilder<Input, Current, Context, Global>
	implements Pipeline.PipelineBuilder<Input, Current, Context, Global>
{
	fns: Pipeline.Pipeline<any, any, Context, Global>[] = [];

	pipe<Next>(
		fn: Pipeline.Pipeline<Current, Next, Context, Global>
	): PipelineBuilder<Input, Next, Context, Global> {
		this.fns.push(fn);

		return this as unknown as PipelineBuilder<Input, Next, Context, Global>;
	}

	done(): Pipeline.Pipeline<Input, Current, Context, Global> {
		const composition: Pipeline.Pipeline<Input, Current, Context, Global> =
			this.fns.reduce((fn1, fn2) => (value, context, global) => {
				const res = fn1(value, context, global);

				if (isPromise(res) || res instanceof Query) {
					return res.then(r => fn2(r, context, global));
				}

				return fn2(res, context, global);
			});

		return (value, context, global) => composition(value, context, global);
	}
}
