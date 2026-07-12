import { TextlintKernel } from "@textlint/kernel";
import markdown from "@textlint/textlint-plugin-markdown";
import { type } from "arktype";
import { describe, expect, it } from "bun:test";

import { createBlockQuoteDepth, maskValue, toMaskedStringSource, validateOptions } from "./index.ts";

const kernel = new TextlintKernel();

// マークダウンをパースし、最初のParagraphノードを取り出す
const firstParagraph = async (text: string): Promise<unknown> => {
  let captured: unknown;
  await kernel.lintText(text, {
    ext: ".md",
    filePath: "t.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: [{
      ruleId: "capture",
      rule: (context: { Syntax: { Paragraph: string; }; }) => ({
        [context.Syntax.Paragraph](node: unknown) {
          captured ??= node;
        },
      }),
    }],
  });
  return captured;
};

describe("validateOptions", () => {
  const schema = type({ "+": "reject", "allows?": "string[]", "skipBlockQuote?": "boolean" });

  it("[positive] 妥当なオブジェクトは通過する", () => {
    expect(() => validateOptions(schema, {})).not.toThrow();
    expect(() => validateOptions(schema, { allows: ["x"], skipBlockQuote: true })).not.toThrow();
  });

  it("[negative] 不明なキーを日本語メッセージで拒否し、該当キーを示す", () => {
    expect(() => validateOptions(schema, { allow: [] })).toThrow("オプションが不正です");
    expect(() => validateOptions(schema, { allow: [] })).toThrow("「allow」");
  });

  it("[negative] ネストしたキーはドット区切りで示す", () => {
    const nested = type({ "+": "reject", "dashes?": { "+": "reject", "emDash?": "'always'" } });
    expect(() => validateOptions(nested, { dashes: { emDash: "sometimes" } })).toThrow("「dashes.emDash」");
  });

  it("[negative] オブジェクト以外はオブジェクト指定を促す", () => {
    expect(() => validateOptions(schema, "invalid")).toThrow("オプションが不正です。オブジェクトで指定してください。");
    expect(() => validateOptions(schema, 42)).toThrow("オブジェクトで指定してください");
  });
});

describe("createBlockQuoteDepth", () => {
  it("enter/exitでネスト深さを管理する", () => {
    const depth = createBlockQuoteDepth();
    expect(depth.isInside()).toBe(false);
    depth.enter();
    expect(depth.isInside()).toBe(true);
    depth.enter();
    expect(depth.isInside()).toBe(true);
    depth.exit();
    expect(depth.isInside()).toBe(true);
    depth.exit();
    expect(depth.isInside()).toBe(false);
  });
});

describe("maskValue", () => {
  it("同一長のダミー文字列を返す（最低1文字）", () => {
    expect(maskValue(3)).toBe("xxx");
    expect(maskValue(0)).toBe("x");
  });
});

describe("toMaskedStringSource", () => {
  it("Codeノードを同一長のダミーに置き換える", async () => {
    const paragraph = await firstParagraph("あ`code`い");
    const source = toMaskedStringSource(paragraph);
    expect(source.toString()).toBe(`あ${maskValue(4)}い`);
  });

  it("extraMaskで追加ノードをマスクする", async () => {
    const paragraph = await firstParagraph("あ`code`い");
    const source = toMaskedStringSource(paragraph, (node) => (node.type === "Str" && node.value === "あ"
      ? { ...node, value: maskValue(1) }
      : undefined));
    expect(source.toString()).toBe(`x${maskValue(4)}い`);
  });
});
