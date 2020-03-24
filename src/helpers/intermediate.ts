import { IntermediateInterface } from "../interfaces";

export class Intermediate<T = {}> implements IntermediateInterface {
  public static of<T>(value: T): Intermediate<T> {
    return new Intermediate(value);
  }

  public static isIntermediate(x: unknown): x is IntermediateInterface {
    return typeof x == "object" && x != null && "intermediate" in x;
  }

  public intermediate: T;

  public constructor(value: T) {
    this.intermediate = value;
  }
}
