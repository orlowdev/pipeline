import { MiddlewareInterface, PipelineInterface, PipelineStaticInterface } from "./interfaces";

/**
 * Shared pipeline code.
 */
export abstract class BasePipeline<TContext> implements PipelineInterface<TContext> {
  /**
   * Internally stored array of Middleware functions.
   */
  protected readonly _middleware: MiddlewareInterface<TContext>[];

  /**
   * @constructor
   * @param middleware
   */
  protected constructor(middleware: MiddlewareInterface<TContext>[]) {
    this._middleware = middleware;
  }

  /**
   * Internally stored array of Middleware functions.
   */
  public get middleware(): MiddlewareInterface<TContext>[] {
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
  public toArray(): MiddlewareInterface<TContext>[] {
    return this.middleware;
  }

  /**
   * Create new Pipeline containing Middleware functions of both current Pipeline and the Pipeline passed as an
   * argument.
   * @param o
   */
  public concat(o: PipelineInterface<TContext>): PipelineInterface<TContext> {
    return ((this.constructor as unknown) as PipelineStaticInterface<TContext>).from(
      this.middleware.concat(o.middleware),
    );
  }

  /**
   * Pointer interface for creating an empty IntermediatePipeline.
   */
  public empty(): PipelineInterface<TContext> {
    return ((this.constructor as unknown) as PipelineStaticInterface<TContext>).empty();
  }

  /**
   * Sequentially call middleware functions stored inside IntermediatePipeline starting with context provided as an
   * argument. If `ctx` argument is not Intermediate, it is wrapped up with `Intermediate.of`.
   * @abstract
   * @param ctx
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract process(ctx: TContext): any;
}
