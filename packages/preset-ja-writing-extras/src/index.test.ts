import { describe, expect, it } from "bun:test";

import preset from "./index.ts";

describe("textlint-rule-preset-ja-writing-extras", () => {
  it("bundles no-dash", () => {
    expect(typeof preset.rules["no-dash"]).toBe("function");
    expect(preset.rulesConfig["no-dash"]).toBe(true);
  });

  it("bundles sentence-per-line", () => {
    expect(typeof preset.rules["sentence-per-line"]).toBe("function");
    expect(preset.rulesConfig["sentence-per-line"]).toBe(true);
  });

  it("bundles no-doubled-additive-conjunction", () => {
    expect(typeof preset.rules["no-doubled-additive-conjunction"]).toBe("function");
    expect(preset.rulesConfig["no-doubled-additive-conjunction"]).toBe(true);
  });
});
