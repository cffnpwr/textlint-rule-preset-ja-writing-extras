import type { TxtParagraphNode } from "@textlint/ast-node-types";
import type { TextlintRuleModule } from "@textlint/types";

import { type } from "arktype";
import { SentenceSplitterSyntax, splitAST } from "sentence-splitter";
import { StringSource } from "textlint-util-to-string";
import { map } from "unist-util-map";

const optionsSchema = type({
  "+": "reject",
  "conjunctions?": "string[]",
  "skipBlockQuote?": "boolean",
  "severity?": "unknown",
});

export type Options = Omit<typeof optionsSchema.infer, "severity">;

const defaultConjunctions = ["さらに", "また", "加えて"];

const validateOptions = (options: unknown) => {
  if (typeof options !== "object" || options === null) {
    return;
  }
  const result = optionsSchema(options);
  if (result instanceof type.errors) {
    throw new TypeError(`オプションが不正です: ${result.summary}`);
  }
};

// 文頭判定のテキスト化の際に同一長のダミー文字列へ置き換え、判定から隔離するノード型
const maskedNodeTypes = new Set(["Code", "Html", "Image"]);

type SentenceNode = ReturnType<typeof splitAST>["children"][number];

// sentence-splitter 5.0.1・textlint-util-to-string 3.3.4・unist-util-mapはtextlint 15系と
// 異なる型定義（@textlint/ast-node-types@13・unist）を要求するため、そのままでは渡せない（構造は互換）。
// 外部ライブラリとの境界に限りアサーションで変換する。
const splitParagraph = (node: TxtParagraphNode) => splitAST(node as unknown as Parameters<typeof splitAST>[0]);

const toMaskedStringSource = (sentence: SentenceNode): StringSource => {
  const masked = map(sentence as unknown as Parameters<typeof map>[0], (child) => {
    if (maskedNodeTypes.has(child.type)) {
      const length = "value" in child && typeof child.value === "string" ? child.value.length : 1;
      return { ...child, type: "Str", value: "x".repeat(Math.max(length, 1)) };
    }
    return child;
  });
  return new StringSource(masked as unknown as ConstructorParameters<typeof StringSource>[0]);
};

const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(options);
  const { Syntax, RuleError, report, locator } = context;
  const conjunctions = options.conjunctions ?? defaultConjunctions;
  const skipBlockQuote = options.skipBlockQuote ?? true;
  let blockQuoteDepth = 0;
  return {
    [Syntax.BlockQuote]() {
      blockQuoteDepth += 1;
    },
    [Syntax.BlockQuoteExit]() {
      blockQuoteDepth -= 1;
    },
    [Syntax.Paragraph](node) {
      if (skipBlockQuote && blockQuoteDepth > 0) {
        return;
      }
      if (conjunctions.length === 0) {
        return;
      }
      const base = node.range[0];
      const sentences = splitParagraph(node).children.filter(
        (child) => child.type === SentenceSplitterSyntax.Sentence,
      );
      const found: { start: number; end: number; word: string; }[] = [];
      for (const sentence of sentences) {
        const source = toMaskedStringSource(sentence);
        const plain = source.toString();
        const trimmed = plain.trimStart();
        const leading = plain.length - trimmed.length;
        const word = conjunctions.find((conjunction) => trimmed.startsWith(`${conjunction}、`));
        if (word === undefined) {
          continue;
        }
        const wordStart = source.originalIndexFromIndex(leading);
        const commaIndex = source.originalIndexFromIndex(leading + word.length);
        if (wordStart === undefined || commaIndex === undefined) {
          continue;
        }
        const sentenceOffset = sentence.range[0] - base;
        found.push({
          start: sentenceOffset + wordStart,
          end: sentenceOffset + commaIndex + 1,
          word,
        });
      }
      found.forEach(({ start, end, word }, index) => {
        if (index === 0) {
          return;
        }
        const previousWords = [...new Set(found.slice(0, index).map((occurrence) => occurrence.word))]
          .map((previousWord) => `「${previousWord}」`)
          .join("・");
        report(
          node,
          new RuleError(
            `累加の接続詞「${word}」が使われていますが、同じ段落内で既に${previousWords}が使われています。接続詞を削るか、文や段落の構成を見直してください。`,
            { padding: locator.range([start, end]) },
          ),
        );
      });
    },
  };
};

export default rule;
