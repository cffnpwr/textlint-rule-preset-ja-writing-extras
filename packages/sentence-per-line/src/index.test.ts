import { describe, expect, it } from "bun:test";

import type { AnyTxtNode } from "@textlint/ast-node-types";
import type { TextlintRuleModule } from "@textlint/types";

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
    rules: [{ ruleId: "sentence-per-line", rule, options }],
  })
  .then((result) => result.messages);

// Given: オプションを固定し、When: テキストをfixした結果の出力テキストを返す
const fixWith = (options?: Options) => (text: string) => kernel
  .fixText(text, {
    ext: ".md",
    filePath: "test.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: [{ ruleId: "sentence-per-line", rule, options }],
  })
  .then((result) => result.output);

// List・ListItem・Paragraphの出現数を数える
// リスト項目内の段落を修正したときに、段落の分割やリスト項目の分裂が起きていないかを確認するために使う
const countNodeType = (node: AnyTxtNode, type: string): number => {
  const self = node.type === type ? 1 : 0;
  if (!("children" in node) || !Array.isArray(node.children)) {
    return self;
  }
  return node.children.reduce(
    (sum: number, child) => sum + countNodeType(child as AnyTxtNode, type),
    self,
  );
};

// Markdownの段落構造（List・ListItem・Paragraphの出現数）を、テキストをlintした結果のメッセージへJSONで埋め込んで取り出す
const structureProbe: TextlintRuleModule = (context) => {
  const { Syntax, RuleError, report } = context;
  return {
    [Syntax.Document](node) {
      report(
        node,
        new RuleError(
          JSON.stringify({
            list: countNodeType(node, "List"),
            listItem: countNodeType(node, "ListItem"),
            paragraph: countNodeType(node, "Paragraph"),
          }),
        ),
      );
    },
  };
};

const structureOf = (text: string) => kernel
  .lintText(text, {
    ext: ".md",
    filePath: "test.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: [{ ruleId: "structure-probe", rule: structureProbe }],
  })
  .then((result) => JSON.parse(result.messages[0]?.message ?? "{}") as Record<string, number>);

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

  describe("自動修正のとき", () => {
    const fix = fixWith();

    it("[negative] 1行に2文ある段落を一文一行に分割する", async () => {
      const output = await fix("一文目です。二文目です。");
      expect(output).toBe("一文目です。\n二文目です。");
    });

    it("[negative] 1行に3文以上ある段落を一文一行に分割する", async () => {
      const output = await fix("一文目です。二文目です。三文目です。");
      expect(output).toBe("一文目です。\n二文目です。\n三文目です。");
    });

    it("[negative] 文の間に空白がある場合、空白を改行に置き換える", async () => {
      const output = await fix("一文目です。 二文目です。");
      expect(output).toBe("一文目です。\n二文目です。");
    });

    it("[negative] リスト項目内の段落を修正すると継続行に正規のインデントが付き、段落構造を保つ", async () => {
      const input = "- 項目です。二文目です。";
      const output = await fix(input);
      expect(output).toBe("- 項目です。\n  二文目です。");
      expect(await structureOf(output)).toEqual(await structureOf(input));
    });

    it("[positive] 既に一文一行になっている段落を変更しない", async () => {
      const output = await fix("一文目です。\n二文目です。");
      expect(output).toBe("一文目です。\n二文目です。");
    });

    it("[positive] 引用内は既定では修正しない", async () => {
      const output = await fix("> 引用です。二文目です。");
      expect(output).toBe("> 引用です。二文目です。");
    });

    it("[negative] 修正後のテキストを同じルールで再度lintすると違反がなくなる", async () => {
      const output = await fix("一文目です。二文目です。三文目です。");
      const messages = await lintWith()(output);
      expect(messages).toHaveLength(0);
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
      rule.linter(JSON.parse("{}"), JSON.parse(optionsJson));
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
