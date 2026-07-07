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
    rules: [{ ruleId: "no-doubled-additive-conjunction", rule, options }],
  })
  .then((result) => result.messages);

describe("no-doubled-additive-conjunction", () => {
  describe("デフォルト設定のとき", () => {
    const lint = lintWith();

    it("[positive] 段落内1回だけの使用を許容する", async () => {
      const messages = await lint("また、一回だけの使用は問題ありません。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 段落が分かれていれば1回ずつの使用を許容する", async () => {
      const messages = await lint("また、一つ目の段落です。\n\nさらに、別の段落なら問題ありません。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 読点が続かない「また」をカウントしない", async () => {
      const messages = await lint("またの機会にお願いします。また聞きした話です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 文中の用法をカウントしない", async () => {
      const messages = await lint("料理に加えて混ぜます。文中の用法は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] 引用を検査対象にしない", async () => {
      const messages = await lint("> また、引用です。また、引用は対象外です。");
      expect(messages).toHaveLength(0);
    });

    it("[positive] コードで始まる文をカウントしない", async () => {
      const messages = await lint("`また、`コードで始まる文は対象外です。\nまた、この段落では1回目の使用です。");
      expect(messages).toHaveLength(0);
    });

    it("[negative] 同一語の2回目を、競合相手を明示して報告する", async () => {
      const messages = await lint("また、一つ目です。\nまた、二つ目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toBe(
        "累加の接続詞「また」が使われていますが、同じ段落内で既に「また」が使われています。接続詞を削るか、文や段落の構成を見直してください。",
      );
      expect(messages[0]?.range).toEqual([10, 13]);
    });

    it("[negative] 異なる累加語の組み合わせも合算して報告する", async () => {
      const messages = await lint("さらに、一つ目です。\nまた、二つ目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toBe(
        "累加の接続詞「また」が使われていますが、同じ段落内で既に「さらに」が使われています。接続詞を削るか、文や段落の構成を見直してください。",
      );
      expect(messages[0]?.range).toEqual([11, 14]);
    });

    it("[negative] 3回使われた場合、2回目以降をそれぞれ報告する", async () => {
      const messages = await lint("また、一。\nさらに、二。\n加えて、三。");
      expect(messages).toHaveLength(2);
      expect(messages[0]?.range).toEqual([6, 10]);
      expect(messages[1]?.message).toBe(
        "累加の接続詞「加えて」が使われていますが、同じ段落内で既に「また」・「さらに」が使われています。接続詞を削るか、文や段落の構成を見直してください。",
      );
      expect(messages[1]?.range).toEqual([13, 17]);
    });

    it("[negative] 強調マークアップ付きの文頭もカウントする", async () => {
      const messages = await lint("**また**、一つ目です。\nまた、二つ目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([14, 17]);
    });
  });

  describe("conjunctionsで対象語を差し替えたとき", () => {
    const lint = lintWith({ conjunctions: ["さらに"] });

    it("[positive] 対象から外れた語を許容する", async () => {
      const messages = await lint("また、一つ目です。また、二つ目です。");
      expect(messages).toHaveLength(0);
    });
  });

  describe("conjunctionsに独自の語を指定したとき", () => {
    const lint = lintWith({ conjunctions: ["しかし"] });

    it("[negative] 指定した語の2回目を報告する", async () => {
      const messages = await lint("しかし、一。しかし、二。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([6, 10]);
    });
  });

  describe("skipBlockQuoteを無効にしたとき", () => {
    const lint = lintWith({ skipBlockQuote: false });

    it("[negative] 引用内の2回目を報告する", async () => {
      const messages = await lint("> また、一。また、二。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([7, 10]);
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
      expect(initWith("{\"conjunction\": []}")).toThrow("conjunction must be removed");
    });

    it("[negative] conjunctionsの型を検証する", () => {
      expect(initWith("{\"conjunctions\": \"また\"}")).toThrow("conjunctions must be an array");
    });

    it("[negative] skipBlockQuoteの型を検証する", () => {
      expect(initWith("{\"skipBlockQuote\": \"true\"}")).toThrow("skipBlockQuote must be boolean");
    });
  });
});
