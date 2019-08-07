import { PipelineInterface, PipelineStaticInterface } from "./interfaces/pipeline.interface";
import { MiddlewareInterface } from "./interfaces/middleware.interface";

export abstract class BasePipeline<TContext> implements PipelineInterface<TContext> {
  protected readonly _middleware: MiddlewareInterface<TContext>[];

  protected constructor(middleware: MiddlewareInterface<TContext>[]) {
    this._middleware = middleware;
  }

  public get middleware(): MiddlewareInterface<TContext>[] {
    return this._middleware;
  }

  public get isEmpty(): boolean {
    return !this.middleware.length;
  }

  public toArray(): MiddlewareInterface<TContext>[] {
    return this.middleware;
  }

  public concat(o: PipelineInterface<TContext>): PipelineInterface<TContext> {
    return ((this.constructor as unknown) as PipelineStaticInterface<TContext>).from(
      this.middleware.concat(o.middleware),
    );
  }

  public empty(): PipelineInterface<TContext> {
    return ((this.constructor as unknown) as PipelineStaticInterface<TContext>).empty();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public abstract process(ctx: TContext): any;
}
