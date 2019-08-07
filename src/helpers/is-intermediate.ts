import { IntermediateInterface } from "../interfaces/intermediate.interface";

export function isIntermediate(x: unknown): x is IntermediateInterface {
  return typeof x == "object" && x != null && "intermediate" in x;
}
