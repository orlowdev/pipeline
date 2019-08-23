import { MiddlewareInterface, PipelineInterface, PipelineStaticInterface } from "./interfaces";

/**
 * Shared pipeline code.
 */
export abstract class BasePipeline<TContext, TResult, TReserved>
  implements PipelineInterface<TContext, TResult, TReserved> {
  /**
   * Internally stored array of Middleware functions.
   */
  protected readonly _middleware: MiddlewareInterface<TContext, TResult>[];

  /**
   * @constructor
   * @param middleware
   */
  protected constructor(middleware: MiddlewareInterface<TContext, TResult>[]) {
    this._middleware = middleware;
  }

  /**
   * Internally stored array of Middleware functions.
   */
  public get middleware(): MiddlewareInterface<TContext, TResult>[] {
    return this._middleware;
  }

  /**
   * Pipeline has no middleware flag.
   */
  public get isEmpty(): boolean {
    return !this.middleware.length;
  }

  /**
   * Array of Middleware functions stored inside Pipeline.
   */
  public toArray(): MiddlewareInterface<TContext, TResult>[] {
    return this.middleware;
  }

  /**
   * Pointer interface for creating an empty IntermediatePipeline.
   */
  public empty(): PipelineInterface<unknown, unknown, unknown> {
    return ((this.constructor as unknown) as PipelineStaticInterface).empty();
  }

  /**
   * Create new Pipeline containing Middleware functions of both current Pipeline and the Pipeline passed as an
   * argument.
   * @abstract
   * @param o
   */
  public abstract concat<TNewResult>(o: PipelineInterface<TResult, TNewResult, TReserved>);

  /**
   * Create a new Pipeline with Middleware provided as an argument appended to the end of the Middleware list.
   * @abstract
   * @param middleware
   */
  public abstract pipe<TNewResult>(middleware: MiddlewareInterface<TResult, TNewResult>);

  /**
   * Sequentially call middleware functions stored inside IntermediatePipeline starting with context provided as an
   * argument.
   * @abstract
   * @param ctx
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract process(ctx: TReserved): any;
}
