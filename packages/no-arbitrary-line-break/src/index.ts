import type { TextlintFixableRuleModule, TextlintRuleReporter } from "@textlint/types";

import { codePointAt, codePointBefore, createBlockQuoteDepth, isJapanese, validateOptions } from "@cffnpwr/textlint-rule-preset-ja-writing-extras-shared";
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

const isSpaceOrTabOrCr = (char: string | undefined): boolean => char === " " || char === "\t" || char === "\r";
const isSpaceOrTab = (char: string | undefined): boolean => char === " " || char === "\t";

// 引数iが指す改行文字を取り除いて行を連結するための置換範囲を求める。
// 開始位置はiから空白類→バックスラッシュ（最大1つ）→空白類の順に後方へ食い進めた手前まで、
// 終了位置は改行の直後（インデックスi+1）からスペース・タブを食い進めた位置まで
// （検出条件（allowAfter判定）には影響しない、修正専用の計算）
const findFixRange = (text: string, i: number): { start: number; end: number; } => {
  let start = i;
  while (start > 0 && isSpaceOrTabOrCr(text[start - 1])) {
    start -= 1;
  }
  if (start > 0 && text[start - 1] === "\\") {
    start -= 1;
  }
  while (start > 0 && isSpaceOrTabOrCr(text[start - 1])) {
    start -= 1;
  }
  let end = i + 1;
  while (end < text.length && isSpaceOrTab(text[end])) {
    end += 1;
  }
  return { start, end };
};

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

const rule: TextlintRuleReporter<Options> = (context, options = {}) => {
  validateOptions(optionsSchema, options);
  const { Syntax, RuleError, report, getSource, locator, fixer } = context;
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
        const { start, end } = findFixRange(text, i);
        const beforeChar = codePointBefore(text, start);
        const afterChar = codePointAt(text, end);
        // 置換範囲の前後がどちらも存在し、かつどちらも和字でないときだけ語間の区切りとして半角スペースを残す
        const replacement = beforeChar !== undefined && afterChar !== undefined && !isJapanese(beforeChar) && !isJapanese(afterChar)
          ? " "
          : "";
        report(node, new RuleError(message, {
          padding: locator.range([i, i + 1]),
          fix: fixer.replaceTextRange([start, end], replacement),
        }));
      }
    },
  };
};

// 検出ロジックはlinter・fixerで共通のため、同じreporter関数を両方へ渡す
const ruleModule: TextlintFixableRuleModule<Options> = { linter: rule, fixer: rule };

export default ruleModule;
