/**
 * Intermediate descriptor used in IntermediatePipeline Middleware functions.
 *
 * @interface IntermediateInterface
 */
export interface IntermediateInterface<TContext = {}> {
  /**
   * Mutable data used in Middleware functions.
   */
  intermediate: TContext;
}
