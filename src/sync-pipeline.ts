import { BasePipeline } from "./base-pipeline";
import { MiddlewareInterface } from "./interfaces";

/**
 * Pipeline is an inverted Monoid that stores an array of middleware functions to be applied to data passed as
 * pipeline.process() argument.
 *
 * Unlike Pipeline, SyncPipeline does not resolve Promises returned from previous Middleware function before passing
 * it to the next one.
 *
 * **NOTE**: SyncPipeline creates a shallow copy of the context argument before passing it to the first middleware.
 */
export class SyncPipeline<TContext, TResult, TReserved> extends BasePipeline<TContext, TResult, TReserved> {
  /**
   * Pointer interface for lifting given middleware functions to a SyncPipeline.
   * @param middleware - n Middleware functions.
   */
  public static of<T, TResult, TReserved = T>(
    middleware: MiddlewareInterface<T, TResult>,
  ): SyncPipeline<T, TResult, TReserved> {
    return new SyncPipeline([middleware]);
  }

  /**
   * Pointer interface for creating a SyncPipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  public static from<T, TResult, TReserved = T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: MiddlewareInterface<any, any>[],
  ): SyncPipeline<T, TResult, TReserved> {
    return new SyncPipeline(middleware);
  }

  /**
   * Pointer interface for creating an empty SyncPipeline.
   */
  public static empty<T, TResult, TReserved = T>(): SyncPipeline<T, TResult, TReserved> {
    return new SyncPipeline([]);
  }

  /**
   * Create new Pipeline containing Middleware functions of both current Pipeline and the Pipeline passed as an
   * argument.
   * @param o
   */
  public concat<TNewResult>(
    o: SyncPipeline<TResult, TNewResult, TReserved>,
  ): SyncPipeline<TResult, TNewResult, TReserved> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return SyncPipeline.from(this.middleware.concat(o.middleware as MiddlewareInterface<any, any>[]));
  }

  /**
   * Create a new SyncPipeline with Middleware provided as an argument appended to the end of the Middleware list.
   * @param middleware
   */
  public pipe<TNewResult>(
    middleware: MiddlewareInterface<TResult, TNewResult>,
  ): SyncPipeline<TResult, TNewResult, TReserved> {
    return SyncPipeline.from([...this.middleware, middleware]);
  }

  /**
   * Sequentially call middleware functions stored inside SyncPipeline starting with context provided as an
   * argument.
   *
   * Values returned from middleware functions will be passed to the next middleware as an argument.
   *
   * @param ctx
   */
  public process(ctx: TReserved): TResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: TReserved | any;

    if (typeof ctx != "object") {
      result = ctx;
    } else {
      result = Array.isArray(ctx) ? [...ctx] : { ...ctx };
    }

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
