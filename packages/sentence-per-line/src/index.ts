import type { TxtParagraphNode } from "@textlint/ast-node-types";
import type { TextlintRuleModule } from "@textlint/types";

import { createBlockQuoteDepth, validateOptions } from "@cffnpwr/textlint-rule-preset-ja-writing-extras-shared";
import { type } from "arktype";
import { SentenceSplitterSyntax, splitAST } from "sentence-splitter";

const optionsSchema = type({
  "+": "reject",
  "skipBlockQuote?": "boolean",
  "severity?": "unknown",
});

export type Options = {
  skipBlockQuote?: boolean;
};

// optionsSchema（実行時バリデータ）と公開型Optionsの同期をコンパイル時に保証する
type Expect<T extends true> = T;
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type _AssertOptions = Expect<Equals<Options, Omit<typeof optionsSchema.infer, "severity">>>;

// sentence-splitter 5.0.1は@textlint/ast-node-types@13の型を要求するため、
// textlint 15系のノードをそのまま渡せない（構造は互換）。
// 外部ライブラリとの境界に限りアサーションで変換する。
const splitParagraph = (node: TxtParagraphNode) => splitAST(node as unknown as Parameters<typeof splitAST>[0]);

const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(optionsSchema, options);
  const { Syntax, RuleError, report, getSource, locator } = context;
  const skipBlockQuote = options.skipBlockQuote ?? true;
  const blockQuote = createBlockQuoteDepth();
  return {
    [Syntax.BlockQuote]: blockQuote.enter,
    [Syntax.BlockQuoteExit]: blockQuote.exit,
    [Syntax.Paragraph](node) {
      if (skipBlockQuote && blockQuote.isInside()) {
        return;
      }
      const raw = getSource(node);
      const base = node.range[0];
      // 文は昇順に並ぶため、単調に進むカーソルで改行を数える
      let cursor = 0;
      let line = 0;
      const lineIndexAt = (relIndex: number) => {
        while (cursor < relIndex) {
          if (raw[cursor] === "\n") {
            line += 1;
          }
          cursor += 1;
        }
        return line;
      };
      const sentences = splitParagraph(node).children.filter(
        (child) => child.type === SentenceSplitterSyntax.Sentence,
      );
      let previousEndLine = -1;
      for (const sentence of sentences) {
        const relStart = sentence.range[0] - base;
        const relEnd = sentence.range[1] - base;
        const startLine = lineIndexAt(relStart);
        if (startLine === previousEndLine) {
          report(
            node,
            new RuleError(
              "1行に複数の文が含まれています。文ごとに改行してください。",
              { padding: locator.range([relStart, relEnd]) },
            ),
          );
        }
        previousEndLine = lineIndexAt(relEnd);
      }
    },
  };
};

export default rule;
