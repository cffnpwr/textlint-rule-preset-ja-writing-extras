import { TextlintKernel } from "@textlint/kernel";
import markdown from "@textlint/textlint-plugin-markdown";
import { describe, expect, it } from "bun:test";

import type { Options } from "./index.ts";

import rule from "./index.ts";

const kernel = new TextlintKernel();

// Given: オプションを固定し、When: テキストをlintした結果のメッセージを返す
const lintWith = (options?: Options) => (text: string) => kernel
  .lintText(text, {
    ext: ".md",
    filePath: "test.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: [{ ruleId: "sentence-per-line", rule, options }],
  })
  .then((result) => result.messages);

describe("sentence-per-line", () => {
  describe("デフォルト設定のとき", () => {
    const lint = lintWith();

    it("[positive] 一文だけの段落を許容する", async () => {
      const messages = await lint("一文だけの段落です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 文ごとに改行された段落を許容する", async () => {
      const messages = await lint("一文目です。\n二文目です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 読点で折り返した1つの文を許容する", async () => {
      const messages = await lint("読点の後で、\n折り返した一文です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] インラインコード内の句点を文の区切りとして扱わない", async () => {
      const messages = await lint("`一。二。` のようなコードは対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 見出しを検査対象にしない", async () => {
      const messages = await lint("# 見出しです。見出しは対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 引用を検査対象にしない", async () => {
      const messages = await lint("> 引用です。引用は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] リスト項目ごとの一文を許容する", async () => {
      const messages = await lint("- 項目です。\n- 次の項目です。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 1行に2文ある場合、2文目を報告する", async () => {
      const messages = await lint("一文目です。二文目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toBe("1行に複数の文が含まれています。文ごとに改行してください。");
      expect(messages[0]?.range).toEqual([6, 12]);
    });

    it("[negative] 1行に3文ある場合、2文目以降をそれぞれ報告する", async () => {
      const messages = await lint("一文目です。二文目です。三文目です。");
      expect(messages).toHaveLength(2);
      expect(messages[0]?.range).toEqual([6, 12]);
      expect(messages[1]?.range).toEqual([12, 18]);
    });

    it("[negative] 折り返した文の行末に始まる次の文を報告する", async () => {
      const messages = await lint("一文目、\n続きです。二文目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([10, 16]);
    });

    it("[negative] リスト項目内の2文目を報告する", async () => {
      const messages = await lint("- 項目です。二文目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([7, 13]);
    });

    it("[positive] CRLFで改行された文ごとの段落を許容する", async () => {
      const messages = await lint("一文目です。\r\n二文目です。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] CRLF段落でも同一行の2文目を報告する", async () => {
      const messages = await lint("一文目です。二文目です。\r\n三文目です。");
      expect(messages).toHaveLength(1);
    });
  });

  describe("skipBlockQuoteを無効にしたとき", () => {
    const lint = lintWith({ skipBlockQuote: false });

    it("[positive] 行を分けた引用を許容する", async () => {
      const messages = await lint("> 引用でも、\n> 行を分けていれば問題ありません。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 引用内の2文目を報告する", async () => {
      const messages = await lint("> 引用です。二文目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([7, 13]);
    });
  });

  describe("不正なオプションを指定したとき", () => {
    // .textlintrc由来の型付けされない入力を検査するため、JSON経由で不正な値を渡す。
    // バリデーションはcontextに触れる前に走るため、contextはダミーでよい
    const initWith = (optionsJson: string) => () => {
      if (typeof rule !== "function") {
        throw new TypeError("rule should be a reporter function");
      }
      rule(JSON.parse("{}"), JSON.parse(optionsJson));
    };

    it("[negative] 不明なオプションキーを拒否する", () => {
      expect(initWith("{\"skipBlockquote\": true}")).toThrow("「skipBlockquote」");
    });

    it("[negative] skipBlockQuoteの型を検証する", () => {
      expect(initWith("{\"skipBlockQuote\": \"true\"}")).toThrow("「skipBlockQuote」");
    });

    it("[negative] オブジェクト以外の値を拒否する", () => {
      expect(initWith("\"invalid\"")).toThrow("オプションが不正です。オブジェクトで指定してください。");
      expect(initWith("42")).toThrow("オブジェクトで指定してください");
    });
  });
});
