import { describe, expect, it } from "vitest";
import { VERSION } from "@ejs2react/core";
import { formatVersion } from "./index";

describe("formatVersion", () => {
  it("prints the tool name and the core version", () => {
    expect(formatVersion()).toBe(`ejs2react v${VERSION}`);
  });
});
