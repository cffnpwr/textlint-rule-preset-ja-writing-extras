import type { TxtParagraphNode } from "@textlint/ast-node-types";
import type { TextlintRuleModule } from "@textlint/types";

import { type } from "arktype";
import { SentenceSplitterSyntax, splitAST } from "sentence-splitter";

const optionsSchema = type({
  "+": "reject",
  "skipBlockQuote?": "boolean",
  "severity?": "unknown",
});

export type Options = Omit<typeof optionsSchema.infer, "severity">;

const validateOptions = (options: unknown) => {
  if (typeof options !== "object" || options === null) {
    return;
  }
  const result = optionsSchema(options);
  if (result instanceof type.errors) {
    throw new TypeError(`オプションが不正です: ${result.summary}`);
  }
};

// sentence-splitter 5.0.1は@textlint/ast-node-types@13の型を要求するため、
// textlint 15系のノードをそのまま渡せない（構造は互換）。
// 外部ライブラリとの境界に限りアサーションで変換する。
const splitParagraph = (node: TxtParagraphNode) => splitAST(node as unknown as Parameters<typeof splitAST>[0]);

const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(options);
  const { Syntax, RuleError, report, getSource, locator } = context;
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
