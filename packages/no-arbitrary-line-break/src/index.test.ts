import { TextlintKernel } from "@textlint/kernel";
import markdown from "@textlint/textlint-plugin-markdown";
import { describe, expect, it } from "bun:test";

import type { Options } from "./index.ts";

import rule from "./index.ts";

const kernel = new TextlintKernel();

const defaultMessage = "文の途中で改行しています。改行は「、」・「。」・「！」・「？」・「」」・「』」・「）」・「］」・「】」・「,」・「.」・「!」・「?」・「)」・「]」の直後でのみ行ってください。";

// Given: オプションを固定し、When: テキストをlintした結果のメッセージを返す
const lintWith = (options?: Options) => (text: string) => kernel
  .lintText(text, {
    ext: ".md",
    filePath: "test.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: [{ ruleId: "no-arbitrary-line-break", rule, options }],
  })
  .then((result) => result.messages);

describe("no-arbitrary-line-break", () => {
  describe("デフォルト設定のとき", () => {
    const lint = lintWith();

    it("[positive] 改行のない一文を許容する", async () => {
      const messages = await lint("改行のない一文です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 読点の直後の改行を許容する", async () => {
      const messages = await lint("読点の後で、\n改行します。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 句点の直後の改行を許容する", async () => {
      const messages = await lint("一文目です。\n二文目です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 全角閉じ括弧の直後の改行を許容する", async () => {
      const messages = await lint("補足（例）\nを続けます。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 半角カンマの直後の改行を許容する", async () => {
      const messages = await lint("English text,\nwrapped after comma.");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 半角閉じ括弧の直後の改行を許容する", async () => {
      const messages = await lint("英語の括弧(example)\nの直後も許可されます。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 半角閉じ角括弧の直後の改行を許容する", async () => {
      const messages = await lint("配列の[0]\nの直後も許可されます。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 許可記号直後のハードブレイクを許容する", async () => {
      const messages = await lint("読点の後、  \nハードブレイクも問題ありません。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] インラインコード内の改行を検査対象にしない", async () => {
      const messages = await lint("コード`a\nb`の中の改行は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] リンクの直後の改行を検査対象にしない", async () => {
      const messages = await lint("[リンク](https://example.com)\nの直後は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 強調の直後の改行を検査対象にしない", async () => {
      const messages = await lint("**強調。**\nの直後は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] HTML要素の直後の改行を検査対象にしない", async () => {
      const messages = await lint("文中でも<br>\nの直後は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 引用を検査対象にしない", async () => {
      const messages = await lint("> 引用の\n> 改行は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 文の途中の改行を、許可記号の一覧とともに報告する", async () => {
      const messages = await lint("文の途中\nで改行しています。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toBe(defaultMessage);
      expect(messages[0]?.range).toEqual([4, 5]);
    });

    it("[negative] 許可されない位置のハードブレイク（行末スペース）を報告する", async () => {
      const messages = await lint("途中で  \n改行します。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([5, 6]);
    });

    it("[negative] 許可されない位置のハードブレイク（バックスラッシュ）を報告する", async () => {
      const messages = await lint("途中で\\\n改行します。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([4, 5]);
    });

    it("[negative] 複数行の違反をそれぞれ報告する", async () => {
      const messages = await lint("一行目が途中\nで、二行目も途\n中で改行しています。");
      expect(messages).toHaveLength(2);
      expect(messages[0]?.range).toEqual([6, 7]);
      expect(messages[1]?.range).toEqual([14, 15]);
    });

    it("[negative] CRLF改行でも文の途中の改行を報告する", async () => {
      const messages = await lint("途中で\r\n改行します。");
      expect(messages).toHaveLength(1);
    });

    it("[positive] CRLF改行でも許可記号の直後は許容する", async () => {
      const messages = await lint("一文目です。\r\n二文目です。");
      expect(messages).toHaveLength(0);
    });
  });

  describe("allowAfterを差し替えたとき", () => {
    it("[positive] 指定した記号の直後の改行を許容する", async () => {
      const messages = await lintWith({ allowAfter: [":"] })("コロンの後:\n続きです。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 対象から外れた記号の直後の改行を、設定値を反映したメッセージで報告する", async () => {
      const messages = await lintWith({ allowAfter: ["。"] })("読点の後で、\n改行します。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toBe("文の途中で改行しています。改行は「。」の直後でのみ行ってください。");
      expect(messages[0]?.range).toEqual([6, 7]);
    });

    it("[negative] 空配列の場合、専用のメッセージですべての改行を報告する", async () => {
      const messages = await lintWith({ allowAfter: [] })("読点の後で、\n改行します。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toBe("文の途中で改行しています。改行は許可されていません。");
      expect(messages[0]?.range).toEqual([6, 7]);
    });
  });

  describe("skipBlockQuoteを無効にしたとき", () => {
    const lint = lintWith({ skipBlockQuote: false });

    it("[positive] 読点の直後で改行した引用を許容する", async () => {
      const messages = await lint("> 引用でも、\n> 読点の後なら問題ありません。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 引用内の文の途中の改行を報告する", async () => {
      const messages = await lint("> 引用の\n> 途中改行です。");
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
      expect(initWith("{\"allowsAfter\": []}")).toThrow("「allowsAfter」");
    });

    it("[negative] allowAfterの型を検証する", () => {
      expect(initWith("{\"allowAfter\": \"、\"}")).toThrow("「allowAfter」");
    });

    it("[negative] allowAfterの2文字以上の要素を拒否する", () => {
      expect(initWith("{\"allowAfter\": [\"、\", \"。」\"]}")).toThrow("「allowAfter.1」");
    });

    it("[negative] skipBlockQuoteの型を検証する", () => {
      expect(initWith("{\"skipBlockQuote\": 1}")).toThrow("「skipBlockQuote」");
    });

    it("[negative] オブジェクト以外の値を拒否する", () => {
      expect(initWith("\"invalid\"")).toThrow("オプションが不正です。オブジェクトで指定してください。");
      expect(initWith("42")).toThrow("オブジェクトで指定してください");
    });
  });
});
