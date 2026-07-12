import type { TxtParagraphNode } from "@textlint/ast-node-types";
import type { TextlintRuleModule } from "@textlint/types";

import { createBlockQuoteDepth, toMaskedStringSource, validateOptions } from "@cffnpwr/textlint-rule-preset-ja-writing-extras-shared";
import { type } from "arktype";
import { SentenceSplitterSyntax, splitAST } from "sentence-splitter";

const optionsSchema = type({
  "+": "reject",
  "conjunctions?": "string[]",
  "skipBlockQuote?": "boolean",
  "severity?": "unknown",
});

export type Options = {
  conjunctions?: string[];
  skipBlockQuote?: boolean;
};

// optionsSchema（実行時バリデータ）と公開型Optionsの同期をコンパイル時に保証する
type Expect<T extends true> = T;
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type _AssertOptions = Expect<Equals<Options, Omit<typeof optionsSchema.infer, "severity">>>;

const defaultConjunctions = ["さらに", "また", "加えて"];

// sentence-splitter 5.0.1はtextlint 15系と異なる型定義（@textlint/ast-node-types@13）を
// 要求するため、そのままでは渡せない（構造は互換）。外部ライブラリとの境界に限りアサーションで変換する。
const splitParagraph = (node: TxtParagraphNode) => splitAST(node as unknown as Parameters<typeof splitAST>[0]);

const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(optionsSchema, options);
  const { Syntax, RuleError, report, locator } = context;
  const conjunctions = options.conjunctions ?? defaultConjunctions;
  const skipBlockQuote = options.skipBlockQuote ?? true;
  const blockQuote = createBlockQuoteDepth();
  return {
    [Syntax.BlockQuote]: blockQuote.enter,
    [Syntax.BlockQuoteExit]: blockQuote.exit,
    [Syntax.Paragraph](node) {
      if (skipBlockQuote && blockQuote.isInside()) {
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
        // 報告範囲は接続詞のみとし、直後の読点は含めない
        const wordEnd = source.originalIndexFromIndex(leading + word.length);
        if (wordStart === undefined || wordEnd === undefined) {
          continue;
        }
        const sentenceOffset = sentence.range[0] - base;
        found.push({
          start: sentenceOffset + wordStart,
          end: sentenceOffset + wordEnd,
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
