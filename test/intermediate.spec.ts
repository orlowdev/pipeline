import { Intermediate } from "../src";

describe("Intermediate", (): void => {
  it("should return an Intermediate", (): void => {
    expect(Intermediate.of(123)).toBeInstanceOf(Intermediate);
  });

  it("should wrap given value into IntermediateInterface", (): void => {
    expect(Intermediate.of(123).intermediate).toEqual(123);
  });
});

describe("Intermediate.isIntermediate", (): void => {
  it("should return true if argument is intermediate", (): void => {
    expect(Intermediate.isIntermediate({ intermediate: 123 })).toEqual(true);
  });

  it("should return false if provided argument is not intermediate", (): void => {
    expect(Intermediate.isIntermediate(123)).toEqual(false);
    expect(Intermediate.isIntermediate({ key: 123 })).toEqual(false);
  });
});
