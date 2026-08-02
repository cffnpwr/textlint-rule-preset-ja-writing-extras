import { describe, expect, it } from "bun:test";

import { TextlintKernel } from "@textlint/kernel";
import markdown from "@textlint/textlint-plugin-markdown";
import { type } from "arktype";

import { codePointAt, codePointBefore, createBlockQuoteDepth, isJapanese, maskValue, toMaskedStringSource, validateOptions } from "./index.ts";

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

describe("isJapanese", () => {
  it("[positive] ひらがな・カタカナ・漢字を和字と判定する", () => {
    expect(isJapanese("あ")).toBe(true);
    expect(isJapanese("ア")).toBe(true);
    expect(isJapanese("漢")).toBe(true);
  });

  it("[positive] 長音符と々を和字と判定する", () => {
    expect(isJapanese("ー")).toBe(true);
    expect(isJapanese("々")).toBe(true);
  });

  it("[positive] サロゲートペアの補助面漢字（CJK拡張B）を和字と判定する", () => {
    expect(isJapanese("\u{20000}")).toBe(true);
  });

  it("[negative] 英数字・記号を和字と判定しない", () => {
    expect(isJapanese("a")).toBe(false);
    expect(isJapanese("1")).toBe(false);
    expect(isJapanese(".")).toBe(false);
  });

  it("[negative] サロゲートペアの絵文字を和字と判定しない", () => {
    expect(isJapanese("\u{1F600}")).toBe(false);
  });

  it("[negative] undefinedを和字と判定しない", () => {
    expect(isJapanese(undefined)).toBe(false);
  });
});

describe("codePointAt", () => {
  it("[positive] BMP文字はそのまま1文字を返す", () => {
    expect(codePointAt("あい", 0)).toBe("あ");
    expect(codePointAt("あい", 1)).toBe("い");
  });

  it("[positive] indexがサロゲートペアの先頭のとき、ペア全体を1文字として返す", () => {
    const text = `あ${"\u{20000}"}い`;
    expect(codePointAt(text, 1)).toBe("\u{20000}");
  });

  it("[negative] 範囲外のindexはundefinedを返す", () => {
    expect(codePointAt("あ", -1)).toBeUndefined();
    expect(codePointAt("あ", 1)).toBeUndefined();
  });
});

describe("codePointBefore", () => {
  it("[positive] BMP文字はそのまま1文字を返す", () => {
    expect(codePointBefore("あい", 1)).toBe("あ");
    expect(codePointBefore("あい", 2)).toBe("い");
  });

  it("[positive] indexの直前がサロゲートペアの末尾のとき、ペア全体を1文字として返す", () => {
    const text = `あ${"\u{20000}"}い`;
    expect(codePointBefore(text, 3)).toBe("\u{20000}");
  });

  it("[negative] index0以下はundefinedを返す", () => {
    expect(codePointBefore("あ", 0)).toBeUndefined();
    expect(codePointBefore("あ", -1)).toBeUndefined();
  });

  it("[negative] 対をなす上位サロゲートがない下位サロゲート単体は結合せず1コードユニットで返す", () => {
    const text = `a${"\uDC00"}`;
    expect(codePointBefore(text, 2)).toBe("\uDC00");
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
