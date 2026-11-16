import { describe, expect, expectTypeOf, it } from "vitest";
import { VERSION } from "./index";

describe("VERSION", () => {
  it("is a semver string", () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has a literal type, not just string", () => {
    // Type-level test: checked by `tsc`, not at runtime.
    // `const` gives VERSION the exact type "0.0.0"...
    expectTypeOf<typeof VERSION>().toEqualTypeOf<"0.0.0">();

    // ...but it is a *widening* literal: passed into a generic function
    // (like expectTypeOf(value)), TypeScript widens it back to `string`.
    expectTypeOf(VERSION).toEqualTypeOf<string>();
  });
});
