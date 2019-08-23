import { SyncPipeline } from "../src";

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe("SyncPipeline", () => {
  describe("process", () => {
    const mw1 = x => x + 1;
    const mw2 = x => x + 2;
    const mw3 = x => x + 3;
    const mw4 = x => x + 4;

    it("should consecutively run synchronous code", () => {
      expect(SyncPipeline.from([mw1, mw2, mw3]).process(1)).toEqual(7);
    });

    it("should consecutively run Promise-based code", () => {
      expect(SyncPipeline.from([mw4, mw1]).process(1)).toEqual(6);
      expect(SyncPipeline.from([mw1, mw4]).process(1)).toEqual(6);
    });

    it("should shallow-copy context if it was an object", () => {
      const int = { intermediate: 1 };
      expect(SyncPipeline.from([]).process(int)).toEqual(int);
      expect(SyncPipeline.from([]).process(int)).not.toBe(int);
    });

    it("should shallow-copy context if it was an array", () => {
      const test = [1, 2, 3];
      expect(SyncPipeline.from([]).process(test)).toEqual(test);
      expect(SyncPipeline.from([]).process(test)).not.toBe(test);
    });

    it("should do nothing if array of Middleware is empty", () => {
      expect(SyncPipeline.from([]).process(1)).toEqual(1);
    });

    it("should preserve context if nothing was returned", () => {
      expect(SyncPipeline.from<number, number>([() => {}, ctx => ctx + 1]).process(1)).toEqual(2);
    });

    it("should throw TypeError if pipeline was created with a non-function", () => {
      try {
        SyncPipeline.of<string, any>(null).process((1 as unknown) as string);
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });

    it("should make a copy of process() argument for internal use", () => {
      const ctx = { test: 1 };
      expect(Object.is(SyncPipeline.of(ctx => ctx).process(ctx), ctx)).toEqual(false);
    });

    it("should refer to context as immutable outside pipeline", () => {
      interface Testable {
        test: number;
      }
      const test: Testable = { test: 1 };
      SyncPipeline.of((ctx: Testable) => {
        ctx.test = 2;
      }).process(test);
      expect(test.test).toEqual(1);
    });

    it("should throw error if the pipeline errored", () => {
      try {
        SyncPipeline.of<string, any>(ctx => ctx.toUpperCase()).process((1 as unknown) as string);
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });
  });

  describe("toArray", () => {
    it("should return internally stored middleware as array", () => {
      const arr = [x => x.intermediate + 2, x => x.intermediate + 3];

      expect(SyncPipeline.from(arr).toArray()).toEqual(arr);
    });
  });

  describe("isEmpty", () => {
    it("should be true if SyncPipeline has no middleware", () => {
      expect(SyncPipeline.empty().isEmpty).toEqual(true);
    });

    it("should be false if SyncPipeline has middleware", () => {
      expect(SyncPipeline.of(() => {}).isEmpty).toEqual(false);
    });
  });

  describe("Semigroup", () => {
    it("ASSOCIATIVITY a.concat(b).concat(c) is equivalent to a.concat(b.concat(c))", () => {
      const a = SyncPipeline.of<number, number>(x => x + 1);
      const b = SyncPipeline.from<number, number>([x => x + 2]);
      const c = SyncPipeline.from<number, number>([x => x + 3]);

      expect(
        a
          .concat(b)
          .concat(c)
          .process(1),
      ).toEqual(a.concat(b.concat(c)).process(1));
    });
  });

  describe("Monoid", () => {
    it("RIGHT IDENTITY m.concat(M.empty()) is equivalent to m", () => {
      const m = SyncPipeline.from<string, string>([x => Number.parseInt(x)]);
      expect(m.concat(SyncPipeline.empty()).process("3")).toEqual(m.process("3"));
    });

    it("LEFT IDENTITY M.empty().concat(m) is equivalent to m", () => {
      const m = SyncPipeline.from<string, string>([x => Number.parseInt(x)]);
      expect(
        SyncPipeline.empty()
          .concat(m)
          .process("3"),
      ).toEqual(m.process("3"));
    });

    it("empty() is the same for instance and static methods", () => {
      expect(SyncPipeline.empty()).toEqual(SyncPipeline.empty().empty());
    });
  });
});
