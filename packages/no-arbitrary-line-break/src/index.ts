import type { TextlintRuleModule } from "@textlint/types";

import { createBlockQuoteDepth, validateOptions } from "@cffnpwr/textlint-rule-preset-ja-writing-extras-shared";
import { type } from "arktype";

const optionsSchema = type({
  "+": "reject",
  "allowAfter?": "(string == 1)[]",
  "skipBlockQuote?": "boolean",
  "severity?": "unknown",
});

export type Options = {
  allowAfter?: string[];
  skipBlockQuote?: boolean;
};

// optionsSchema（実行時バリデータ）と公開型Optionsの同期をコンパイル時に保証する
type Expect<T extends true> = T;
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type _AssertOptions = Expect<Equals<Options, Omit<typeof optionsSchema.infer, "severity">>>;

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

const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(optionsSchema, options);
  const { Syntax, RuleError, report, getSource, locator } = context;
  const allowAfterList = options.allowAfter ?? defaultAllowAfter;
  const allowAfter = new Set(allowAfterList);
  const skipBlockQuote = options.skipBlockQuote ?? true;
  const message = allowAfterList.length > 0
    ? `文の途中で改行しています。改行は${allowAfterList
      .map((char) => `「${char}」`)
      .join("・")}の直後でのみ行ってください。`
    : "文の途中で改行しています。改行は許可されていません。";
  const blockQuote = createBlockQuoteDepth();
  return {
    [Syntax.BlockQuote]: blockQuote.enter,
    [Syntax.BlockQuoteExit]: blockQuote.exit,
    [Syntax.Paragraph](node) {
      if (skipBlockQuote && blockQuote.isInside()) {
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
