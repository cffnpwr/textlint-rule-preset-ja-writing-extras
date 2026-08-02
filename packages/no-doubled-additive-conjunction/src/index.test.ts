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

// Given: オプションを固定し、When: `--fix`相当のfixTextを実行した結果を返す
// suggestionsはfixTextでは適用されないため、出力が入力と変わらないことの確認に使う
const fixWith = (options?: Options) => (text: string) => kernel.fixText(text, {
  ext: ".md",
  filePath: "test.md",
  plugins: [{ pluginId: "markdown", plugin: markdown }],
  rules: [{ ruleId: "no-doubled-additive-conjunction", rule, options }],
});

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
      expect(messages[0]?.range).toEqual([10, 12]);
    });

    it("[negative] 異なる累加語の組み合わせも合算して報告する", async () => {
      const messages = await lint("さらに、一つ目です。\nまた、二つ目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.message).toBe(
        "累加の接続詞「また」が使われていますが、同じ段落内で既に「さらに」が使われています。接続詞を削るか、文や段落の構成を見直してください。",
      );
      expect(messages[0]?.range).toEqual([11, 13]);
    });

    it("[negative] 3回使われた場合、2回目以降をそれぞれ報告する", async () => {
      const messages = await lint("また、一。\nさらに、二。\n加えて、三。");
      expect(messages).toHaveLength(2);
      expect(messages[0]?.range).toEqual([6, 9]);
      expect(messages[1]?.message).toBe(
        "累加の接続詞「加えて」が使われていますが、同じ段落内で既に「また」・「さらに」が使われています。接続詞を削るか、文や段落の構成を見直してください。",
      );
      expect(messages[1]?.range).toEqual([13, 16]);
    });

    it("[negative] 強調マークアップ付きの文頭もカウントする", async () => {
      const messages = await lint("**また**、一つ目です。\nまた、二つ目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([14, 16]);
    });

    it("[positive] 読点だけを囲む強調マークアップがある場合は接続詞をカウントしない", async () => {
      // 「さらに**、**Bです。」は`**`が強調として解釈されず地の文字のまま残るため、
      // 文頭判定用のテキストが"さらに**、**…"のままとなり「さらに、」に一致せず、
      // そもそも接続詞として検出されない（実測で確認）
      const messages = await lint("また、Aです。さらに**、**Bです。");
      expect(messages).toHaveLength(0);
    });
  });

  describe("suggestionsのとき", () => {
    const lint = lintWith();
    const fix = fixWith();

    it("[negative] 接続詞と直後の読点を削除するsuggestionを1件だけ提示する", async () => {
      const messages = await lint("また、一つ目です。\nまた、二つ目です。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.suggestions).toHaveLength(1);
    });

    it("[negative] suggestionのmessageが削除内容を示す", async () => {
      const messages = await lint("また、一つ目です。\nまた、二つ目です。");
      expect(messages[0]?.suggestions?.[0]?.message).toBe("接続詞「また」と直後の読点を削除します。");
    });

    it("[negative] suggestionのfixが接続詞と直後の読点のrangeを空文字列に置き換える", async () => {
      const messages = await lint("また、一つ目です。\nまた、二つ目です。");
      expect(messages[0]?.suggestions?.[0]?.fix).toEqual({ range: [10, 13], text: "" });
    });

    it("[negative] suggestionのfixを適用すると接続詞と直後の読点が消えたテキストになる", async () => {
      const text = "また、一つ目です。\nまた、二つ目です。";
      const messages = await lint(text);
      const fixCommand = messages[0]?.suggestions?.[0]?.fix;
      if (fixCommand === undefined) {
        throw new Error("fix command should exist");
      }
      const [start, end] = fixCommand.range;
      const applied = text.slice(0, start) + fixCommand.text + text.slice(end);
      expect(applied).toBe("また、一つ目です。\n二つ目です。");
    });

    it("[negative] 読点の直後にインラインコードが続く文でもsuggestionのfix rangeが読点までを指す", async () => {
      const text = "また、Aです。さらに、`code`です。";
      const messages = await lint(text);
      expect(messages[0]?.suggestions?.[0]?.fix).toEqual({ range: [7, 11], text: "" });
      const fixCommand = messages[0]?.suggestions?.[0]?.fix;
      if (fixCommand === undefined) {
        throw new Error("fix command should exist");
      }
      const [start, end] = fixCommand.range;
      const applied = text.slice(0, start) + fixCommand.text + text.slice(end);
      expect(applied).toBe("また、Aです。`code`です。");
    });

    it("[negative] 読点の直後に強調マークアップが続く文でもsuggestionのfix rangeが読点までを指す", async () => {
      const text = "また、Aです。さらに、**強調**です。";
      const messages = await lint(text);
      expect(messages[0]?.suggestions?.[0]?.fix).toEqual({ range: [7, 11], text: "" });
      const fixCommand = messages[0]?.suggestions?.[0]?.fix;
      if (fixCommand === undefined) {
        throw new Error("fix command should exist");
      }
      const [start, end] = fixCommand.range;
      const applied = text.slice(0, start) + fixCommand.text + text.slice(end);
      expect(applied).toBe("また、Aです。**強調**です。");
    });

    it("[negative] 読点が段落の末尾にある場合もsuggestionのfix rangeが読点までを指す", async () => {
      const text = "また、Aです。さらに、";
      const messages = await lint(text);
      expect(messages[0]?.suggestions?.[0]?.fix).toEqual({ range: [7, 11], text: "" });
      const fixCommand = messages[0]?.suggestions?.[0]?.fix;
      if (fixCommand === undefined) {
        throw new Error("fix command should exist");
      }
      const [start, end] = fixCommand.range;
      const applied = text.slice(0, start) + fixCommand.text + text.slice(end);
      expect(applied).toBe("また、Aです。");
    });

    it("[negative] fixTextを実行してもsuggestionは適用されずテキストが変わらない", async () => {
      const text = "また、一つ目です。\nまた、二つ目です。";
      const result = await fix(text);
      expect(result.output).toBe(text);
    });

    it("[negative] 接続詞自体が強調マークアップで囲まれている場合は検出はするがsuggestionを付けない", async () => {
      // padding（range）は元テキストで接続詞そのものが続くかを直接確認するため、
      // 強調の`**`を含まず"さらに"のみを指す
      const messages = await lint("また、Aです。\n**さらに**、Bです。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([10, 13]);
      // 元テキストの[start, end+1)が"さらに*"となり"さらに、"と一致しないため、
      // 閉じ`**`を削ってMarkdownを壊す削除範囲を提示するよりsuggestionを見送る
      expect(messages[0]?.suggestions).toBeUndefined();
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
      expect(messages[0]?.range).toEqual([6, 9]);
    });
  });

  describe("skipBlockQuoteを無効にしたとき", () => {
    const lint = lintWith({ skipBlockQuote: false });

    it("[negative] 引用内の2回目を報告する", async () => {
      const messages = await lint("> また、一。また、二。");
      expect(messages).toHaveLength(1);
      expect(messages[0]?.range).toEqual([7, 9]);
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
      expect(initWith("{\"conjunction\": []}")).toThrow("「conjunction」");
    });

    it("[negative] conjunctionsの型を検証する", () => {
      expect(initWith("{\"conjunctions\": \"また\"}")).toThrow("「conjunctions」");
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
