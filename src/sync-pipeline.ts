import { BasePipeline } from "./base-pipeline";
import { MiddlewareInterface } from "./interfaces/middleware.interface";
import { IntermediateInterface } from "./interfaces/intermediate.interface";

export class SyncPipeline<TContext> extends BasePipeline<TContext> {
  public static of<T>(...middleware: MiddlewareInterface<T>[]): SyncPipeline<T> {
    return new SyncPipeline<T>(middleware);
  }

  public static from<T>(middleware: MiddlewareInterface<T>[]): SyncPipeline<T> {
    return new SyncPipeline<T>(middleware);
  }

  public static empty<T>(): SyncPipeline<T> {
    return new SyncPipeline<T>([]);
  }

  public process(ctx: TContext): TContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: IntermediateInterface | any = typeof ctx == "object" ? { ...ctx } : ctx;

    for (let i = 0; i < this._middleware.length; i++) {
      if (this._middleware[i] == null) {
        throw new TypeError("Middleware must be a function");
      }

      const done = this._middleware[i](result);

      if (done != null) {
        result = done;
      }
    }

    return result;
  }
}
