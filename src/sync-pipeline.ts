import { BasePipeline } from "./base-pipeline";
import { IntermediateInterface, MiddlewareInterface } from "./interfaces";

/**
 * Pipeline is an inverted Monoid that stores an array of middleware functions to be applied to data passed as
 * pipeline.process() argument.
 *
 * Unlike Pipeline, SyncPipeline does not resolve Promises returned from previous Middleware function before passing
 * it to the next one.
 *
 * **NOTE**: SyncPipeline creates a shallow copy of the context argument before passing it to the first middleware.
 */
export class SyncPipeline<TContext> extends BasePipeline<TContext> {
  /**
   * Pointer interface for lifting given middleware functions to a SyncPipeline.
   * @param middleware - n Middleware functions.
   */
  public static of<T>(...middleware: MiddlewareInterface<T>[]): SyncPipeline<T> {
    return new SyncPipeline<T>(middleware);
  }

  /**
   * Pointer interface for creating a SyncPipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  public static from<T>(middleware: MiddlewareInterface<T>[]): SyncPipeline<T> {
    return new SyncPipeline<T>(middleware);
  }

  /**
   * Pointer interface for creating an empty SyncPipeline.
   */
  public static empty<T>(): SyncPipeline<T> {
    return new SyncPipeline<T>([]);
  }

  /**
   * Sequentially call middleware functions stored inside SyncPipeline starting with context provided as an
   * argument.
   *
   * Values returned from middleware functions will be passed to the next middleware as an argument.
   *
   * If previous middleware function returned nullable value (**null** or **undefined**), the `ctx` will be
   * passed to the next middleware unmodified.
   *
   * @param ctx
   */
  public process(ctx: TContext): TContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: IntermediateInterface | any;

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
