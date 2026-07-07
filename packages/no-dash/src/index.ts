import type { TxtHeaderNode, TxtParagraphNode, TxtTableCellNode } from "@textlint/ast-node-types";
import type { TextlintRuleModule } from "@textlint/types";

import { matchPatterns } from "@textlint/regexp-string-matcher";
import { type } from "arktype";
import { StringSource } from "textlint-util-to-string";
import { match } from "ts-pattern";
import { map } from "unist-util-map";

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

const validateOptions = (options: unknown) => {
  if (typeof options !== "object" || options === null) {
    return;
  }
  const result = optionsSchema(options);
  if (result instanceof type.errors) {
    throw new TypeError(`オプションが不正です: ${result.summary}`);
  }
};

// U+30FC: 長音符（Script=CommonのためScript指定では拾えない）
const japaneseCharPattern = /[\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Han}\u30FC々]/u;

const isJapanese = (char: string | undefined) => char !== undefined && japaneseCharPattern.test(char);

type SourceTargetNode = TxtHeaderNode | TxtParagraphNode | TxtTableCellNode;

// 本文テキスト化の際に同一長のダミー文字列へ置き換え、隣接判定から隔離するノード型
const maskedNodeTypes = new Set(["Code", "Html", "Image"]);

// unist-util-mapとtextlint-util-to-string 3.3.4はtextlint 15系と異なる型定義
// （unist・@textlint/ast-node-types@13）を要求するため、そのままでは渡せない（構造は互換）。
// 外部ライブラリとの境界に限りアサーションで変換する。
const toMaskedStringSource = (node: SourceTargetNode): StringSource => {
  const masked = map(node as unknown as Parameters<typeof map>[0], (child) => {
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
  let blockQuoteDepth = 0;
  const check = (node: SourceTargetNode) => {
    if (dashRunPattern === null) {
      return;
    }
    if (skipBlockQuote && blockQuoteDepth > 0) {
      return;
    }
    const source = toMaskedStringSource(node);
    const text = source.toString();
    const allowedRanges = allows.length > 0 ? matchPatterns(text, allows) : [];
    for (const dashMatch of text.matchAll(dashRunPattern)) {
      const start = dashMatch.index;
      const end = start + dashMatch[0].length;
      if (allowedRanges.some((range) => range.startIndex < end && start < range.endIndex)) {
        continue;
      }
      const before = text[start - 1];
      const after = text[end];
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
    [Syntax.BlockQuote]() {
      blockQuoteDepth += 1;
    },
    [Syntax.BlockQuoteExit]() {
      blockQuoteDepth -= 1;
    },
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
