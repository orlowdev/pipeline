/**
 * Middleware function interface describes the function requirements to be considered a Middleware function.
 *
 * @interface MiddlewareInterface
 */
export interface MiddlewareInterface<TContext = {}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (ctx: TContext): any;
}
