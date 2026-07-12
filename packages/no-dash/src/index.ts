import type { TxtHeaderNode, TxtParagraphNode, TxtTableCellNode } from "@textlint/ast-node-types";
import type { TextlintRuleModule } from "@textlint/types";

import { createBlockQuoteDepth, maskValue, toMaskedStringSource, validateOptions } from "@cffnpwr/textlint-rule-preset-ja-writing-extras-shared";
import { matchPatterns } from "@textlint/regexp-string-matcher";
import { type } from "arktype";
import { match } from "ts-pattern";

const dashContextSchema = type("'always' | 'japanese-both' | 'japanese-either'");

export type DashContext = typeof dashContextSchema.infer;

const dashKinds = ["emDash", "horizontalBar", "enDash"] as const;

export type DashKind = (typeof dashKinds)[number];

const optionsSchema = type({
  "+": "reject",
  "allows?": "string[]",
  "dashes?": {
    "+": "reject",
    "emDash?": dashContextSchema,
    "horizontalBar?": dashContextSchema,
    "enDash?": dashContextSchema,
  },
  "skipBlockQuote?": "boolean",
  "severity?": "unknown",
});

export type Options = Omit<typeof optionsSchema.infer, "severity">;

const dashCharacters: Record<DashKind, string> = {
  emDash: "\u2014",
  horizontalBar: "\u2015",
  enDash: "\u2013",
};

const defaultDashes: Partial<Record<DashKind, DashContext>> = {
  emDash: "always",
  horizontalBar: "always",
  enDash: "japanese-both",
};

// U+30FC: 長音符（Script=CommonのためScript指定では拾えない）
const japaneseCharPattern = /[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\u30FC々]/u;

const isJapanese = (char: string | undefined) => char !== undefined && japaneseCharPattern.test(char);

// index直後から始まるコードポイント（サロゲートペアを1文字として扱う）
const codePointAt = (text: string, index: number): string | undefined => {
  if (index < 0 || index >= text.length) {
    return undefined;
  }
  const codePoint = text.codePointAt(index);
  return codePoint === undefined ? undefined : String.fromCodePoint(codePoint);
};

// indexの直前で終わるコードポイント（サロゲートペアを1文字として扱う）
const codePointBefore = (text: string, index: number): string | undefined => {
  if (index <= 0) {
    return undefined;
  }
  const low = text.charCodeAt(index - 1);
  if (low >= 0xDC00 && low <= 0xDFFF && index >= 2) {
    const high = text.charCodeAt(index - 2);
    if (high >= 0xD800 && high <= 0xDBFF) {
      return text.slice(index - 2, index);
    }
  }
  return text[index - 1];
};

type SourceTargetNode = TxtHeaderNode | TxtParagraphNode | TxtTableCellNode;

// autolink（<https://…>）はStr子にURL文字列がそのまま入るため、表示テキストがURLそのものの
// Linkを判定してURLを本文から隔離する。通常リンク（表示テキスト≠URL）の表示テキストは対象に残す
const isAutolinkParent = (parent: { type: string; [key: string]: unknown; } | null | undefined): boolean => {
  if (parent?.type !== "Link") {
    return false;
  }
  if (typeof parent.url !== "string" || !Array.isArray(parent.children)) {
    return false;
  }
  const childText = parent.children
    .map((child) => (typeof child === "object" && child !== null && "value" in child && typeof child.value === "string"
      ? child.value
      : ""))
    .join("");
  return childText === parent.url;
};

// autolinkのURL文字列を同一長のダミーに置き換えるマスク（toMaskedStringSourceへ渡す）
const maskAutolinkUrl = (node: { type: string; [key: string]: unknown; }, parent: { type: string; [key: string]: unknown; } | null | undefined) => {
  if (node.type === "Str" && typeof node.value === "string" && isAutolinkParent(parent)) {
    return { ...node, value: maskValue(node.value.length) };
  }
  return undefined;
};

const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(optionsSchema, options);
  const { Syntax, RuleError, report, locator } = context;
  const allows = options.allows ?? [];
  const dashes = options.dashes ?? defaultDashes;
  const skipBlockQuote = options.skipBlockQuote ?? true;
  const contextByChar = new Map<string, DashContext>();
  for (const kind of dashKinds) {
    const dashContext = dashes[kind];
    if (dashContext !== undefined) {
      contextByChar.set(dashCharacters[kind], dashContext);
    }
  }
  const dashRunPattern = contextByChar.size > 0
    ? new RegExp(`[${[...contextByChar.keys()].join("")}]+`, "gu")
    : null;
  const blockQuote = createBlockQuoteDepth();
  const check = (node: SourceTargetNode) => {
    if (dashRunPattern === null) {
      return;
    }
    if (skipBlockQuote && blockQuote.isInside()) {
      return;
    }
    const source = toMaskedStringSource(node, maskAutolinkUrl);
    const text = source.toString();
    const allowedRanges = allows.length > 0 ? matchPatterns(text, allows) : [];
    for (const dashMatch of text.matchAll(dashRunPattern)) {
      const start = dashMatch.index;
      const end = start + dashMatch[0].length;
      if (allowedRanges.some((range) => range.startIndex < end && start < range.endIndex)) {
        continue;
      }
      const before = codePointBefore(text, start);
      const after = codePointAt(text, end);
      const shouldReport = [...new Set(dashMatch[0])].some((char) => match(contextByChar.get(char))
        .with("always", () => true)
        .with("japanese-both", () => isJapanese(before) && isJapanese(after))
        .with("japanese-either", () => isJapanese(before) || isJapanese(after))
        .with(undefined, () => false)
        .exhaustive());
      if (!shouldReport) {
        continue;
      }
      const originalStart = source.originalIndexFromIndex(start);
      const originalLast = source.originalIndexFromIndex(end - 1);
      if (originalStart === undefined || originalLast === undefined) {
        continue;
      }
      report(
        node,
        new RuleError(
          `ダッシュ「${dashMatch[0]}」が使われています。同格・補足の挿入は括弧（）に、言い換えは句点で二文に分けるか読点でつないでください。`,
          { padding: locator.range([originalStart, originalLast + 1]) },
        ),
      );
    }
  };
  return {
    [Syntax.BlockQuote]: blockQuote.enter,
    [Syntax.BlockQuoteExit]: blockQuote.exit,
    [Syntax.Paragraph](node) {
      check(node);
    },
    [Syntax.Header](node) {
      check(node);
    },
    [Syntax.TableCell](node) {
      check(node);
    },
  };
};

export default rule;
