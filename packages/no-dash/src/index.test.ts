import { describe, expect, it } from "bun:test";

import { TextlintKernel } from "@textlint/kernel";
import markdown from "@textlint/textlint-plugin-markdown";

import type { Options } from "./index.ts";

import rule from "./index.ts";

const kernel = new TextlintKernel();

// Given: オプションを固定し、When: テキストをlintした結果のメッセージを返す
const lintWith = (options?: Options) => (text: string) => kernel
  .lintText(text, {
    ext: ".md",
    filePath: "test.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: [{ ruleId: "no-dash", rule, options }],
  })
  .then((result) => result.messages);

describe("no-dash", () => {
  describe("デフォルト設定のとき", () => {
    const lint = lintWith();

    it("[positive] ダッシュを含まない文を許容する", async () => {
      const messages = await lint("普通の文です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 英語複合語のenダッシュを許容する", async () => {
      const messages = await lint("Curry–Howard対応の話です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 数字間のenダッシュ（範囲表記）を許容する", async () => {
      const messages = await lint("1–3月の予定です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] インラインコード内のダッシュを許容する", async () => {
      const messages = await lint("ダッシュは `—` のようにコードで書きます。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] コードブロック内のダッシュを許容する", async () => {
      const messages = await lint("```\n— コードブロック内\n```");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 引用内のダッシュを許容する", async () => {
      const messages = await lint("> 引用の—はそのままにします。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] emダッシュを検出し、位置とメッセージを報告する", async () => {
      const messages = await lint("これは—強調—です。");
      expect(messages).toHaveLength(2);
      expect(messages[0]?.message).toBe(
        "ダッシュ「—」が使われています。同格・補足の挿入は括弧（）に、言い換えは句点で二文に分けるか読点でつないでください。",
      );
      expect(messages[0]?.range).toEqual([3, 4]);
      expect(messages[1]?.range).toEqual([6, 7]);
    });

    it("[negative] 二倍ダッシュを1つのエラーとして検出する", async () => {
      const messages = await lint("考え——それは重要です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toContain("ダッシュ「——」");
      expect(messages[0]?.range).toEqual([2, 4]);
    });

    it("[negative] horizontal barを検出する", async () => {
      const messages = await lint("それ―つまり補足です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([2, 3]);
    });

    it("[negative] 和字に挟まれたenダッシュを検出する", async () => {
      const messages = await lint("カリー–ハワード対応です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([3, 4]);
    });

    it("[negative] 強調マークアップ境界のenダッシュを本文の文字で判定して検出する", async () => {
      const messages = await lint("日本語**強調**–続きです。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([9, 10]);
    });

    it("[negative] 強調内のenダッシュをマークアップを除いたテキストで検出する", async () => {
      const messages = await lint("**日本語–日本語**です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([5, 6]);
    });

    it("[negative] 見出し内のemダッシュを検出する", async () => {
      const messages = await lint("# 見出しの—です");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([6, 7]);
    });

    it("[negative] テーブルセル内のemダッシュを検出する", async () => {
      const messages = await lint("| 見出し |\n| --- |\n| セル—補足 |");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toContain("ダッシュ「—」");
    });

    it("[negative] サロゲートペア（拡張漢字）に挟まれたenダッシュを検出する", async () => {
      const messages = await lint("𠮟る–𠮟るの話です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([3, 4]);
    });

    it("[positive] オートリンクのURL内のダッシュを許容する", async () => {
      const messages = await lint("詳細は<https://example.com/a—b>を見てください。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] リンクの表示テキスト内のダッシュは検出する", async () => {
      const messages = await lint("詳細は[表示—テキスト](https://example.com/x)です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([6, 7]);
    });

    it("[negative] CRLF改行を含む段落でも位置を保って検出する", async () => {
      const messages = await lint("一行目です。\r\nこれは—補足です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toContain("ダッシュ「—」");
    });
  });

  describe("allowsで例外を指定したとき", () => {
    const lint = lintWith({ allows: ["カリー–ハワード"] });

    it("[positive] 例外パターンに一致するenダッシュを許容する", async () => {
      const messages = await lint("カリー–ハワード対応です。");
      expect(messages).toHaveLength(0);
    });
  });

  describe("allowsに正規表現形式を指定したとき", () => {
    const lint = lintWith({ allows: ["/[ぁ-ん]+—[ぁ-ん]+/"] });

    it("[positive] 正規表現に一致するダッシュを許容する", async () => {
      const messages = await lint("これ—ここは許容です。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 正規表現に一致しないダッシュは検出する", async () => {
      const messages = await lint("漢字—漢字は検出です。");
      expect(messages).toHaveLength(1);
    });
  });

  describe("dashesでenダッシュを対象から外したとき", () => {
    const lint = lintWith({ dashes: { emDash: "always", horizontalBar: "always" } });

    it("[positive] 和字に挟まれたenダッシュを許容する", async () => {
      const messages = await lint("カリー–ハワード対応です。");
      expect(messages).toHaveLength(0);
    });
  });

  describe("dashesでenダッシュのみを対象にしたとき", () => {
    const lint = lintWith({ dashes: { enDash: "japanese-both" } });

    it("[positive] 対象から外れたemダッシュを許容する", async () => {
      const messages = await lint("これは—ダッシュ—です。");
      expect(messages).toHaveLength(0);
    });
  });

  describe("dashesでjapanese-eitherを指定したとき", () => {
    const lint = lintWith({ dashes: { enDash: "japanese-either" } });

    it("[positive] 両側が英字のenダッシュを許容する", async () => {
      const messages = await lint("A–Bです。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 片側が和字のenダッシュを検出する", async () => {
      const messages = await lint("これは–です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([3, 4]);
    });
  });

  describe("skipBlockQuoteを無効にしたとき", () => {
    const lint = lintWith({ skipBlockQuote: false });

    it("[negative] 引用内のダッシュを検出する", async () => {
      const messages = await lint("> 引用の—も検査します。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([5, 6]);
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
      expect(initWith("{\"allow\": []}")).toThrow("「allow」");
    });

    it("[negative] dashesの不明なキーを拒否する", () => {
      expect(initWith("{\"dashes\": {\"emdash\": \"always\"}}")).toThrow("「dashes.emdash」");
    });

    it("[negative] dashesの不正な値を拒否する", () => {
      expect(initWith("{\"dashes\": {\"emDash\": \"sometimes\"}}")).toThrow("「dashes.emDash」");
    });

    it("[negative] skipBlockQuoteの型を検証する", () => {
      expect(initWith("{\"skipBlockQuote\": \"yes\"}")).toThrow("「skipBlockQuote」");
    });

    it("[negative] オブジェクト以外の値を拒否する", () => {
      expect(initWith("\"invalid\"")).toThrow("オプションが不正です。オブジェクトで指定してください。");
      expect(initWith("42")).toThrow("オブジェクトで指定してください");
    });
  });
});
