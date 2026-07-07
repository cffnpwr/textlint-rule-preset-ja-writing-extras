import type { TextlintRuleModule } from "@textlint/types";

import { type } from "arktype";

const optionsSchema = type({
  "+": "reject",
  "allowAfter?": "(string == 1)[]",
  "skipBlockQuote?": "boolean",
  "severity?": "unknown",
});

export type Options = Omit<typeof optionsSchema.infer, "severity">;

const defaultAllowAfter = [
  "、",
  "。",
  "！",
  "？",
  "」",
  "』",
  "）",
  "］",
  "】",
  ",",
  ".",
  "!",
  "?",
  ")",
  "]",
];

const validateOptions = (options: unknown) => {
  if (typeof options !== "object" || options === null) {
    return;
  }
  const result = optionsSchema(options);
  if (result instanceof type.errors) {
    throw new TypeError(`オプションが不正です: ${result.summary}`);
  }
};

const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(options);
  const { Syntax, RuleError, report, getSource, locator } = context;
  const allowAfterList = options.allowAfter ?? defaultAllowAfter;
  const allowAfter = new Set(allowAfterList);
  const skipBlockQuote = options.skipBlockQuote ?? true;
  const message = allowAfterList.length > 0
    ? `文の途中で改行しています。改行は${allowAfterList
      .map((char) => `「${char}」`)
      .join("・")}の直後でのみ行ってください。`
    : "文の途中で改行しています。改行は許可されていません。";
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
      const base = node.range[0];
      const text = getSource(node);
      // Str以外のインライン要素（リンク・強調・コード・HTML等）の内部・直後の改行は対象外。
      // Breakは改行そのものなので除外しない
      const inlineRanges = node.children
        .filter((child) => child.type !== "Str" && child.type !== "Break")
        .map((child) => [child.range[0] - base, child.range[1] - base] as const);
      const isInInline = (index: number) => inlineRanges.some(([start, end]) => start <= index && index < end);
      for (let i = 0; i < text.length; i += 1) {
        if (text[i] !== "\n") {
          continue;
        }
        if (isInInline(i)) {
          continue;
        }
        let j = i - 1;
        while (j >= 0 && (text[j] === " " || text[j] === "\t" || text[j] === "\r")) {
          j -= 1;
        }
        if (j >= 0 && text[j] === "\\") {
          j -= 1;
        }
        if (j >= 0 && isInInline(j)) {
          continue;
        }
        const before = j >= 0 ? text[j] : undefined;
        if (before !== undefined && allowAfter.has(before)) {
          continue;
        }
        report(node, new RuleError(message, { padding: locator.range([i, i + 1]) }));
      }
    },
  };
};

export default rule;
