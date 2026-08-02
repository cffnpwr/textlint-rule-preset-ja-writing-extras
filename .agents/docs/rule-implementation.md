# ルール実装の共通パターン

`packages/no-dash/src/index.ts`と`packages/no-doubled-additive-conjunction/src/index.ts`が代表例。

## ルールの形

`TextlintRuleModule<Options>`を実装し、default exportする。
ハンドラーを返す前に`validateOptions`でオプションを検証する。

```ts
const rule: TextlintRuleModule<Options> = (context, options = {}) => {
  validateOptions(optionsSchema, options);
  const { Syntax, RuleError, report, locator } = context;
  // ...
  return {
    [Syntax.Paragraph](node) { /* ... */ },
  };
};

export default rule;
```

## オプションの検証と型の同期

`.textlintrc`由来のオプションは型が付かないため、arktypeのスキーマで実行時に検証する。

- `"+": "reject"`で未知のキーを拒否する。
- textlintがルールへ渡すため`"severity?": "unknown"`を許可する。
- ネストしたオブジェクトにも`"+": "reject"`を付ける。

公開する`Options`型は手で書き、スキーマとの一致をコンパイル時のアサーションで保証する。

```ts
type Expect<T extends true> = T;
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type _AssertOptions = Expect<Equals<Options, Omit<typeof optionsSchema.infer, "severity">>>;
```

検証の失敗時は`packages/shared`の`validateOptions`が日本語の`TypeError`を投げる。
メッセージはarktypeの`path`から組み立てるため、英語の`summary`には依存しない。

## 引用ブロックのスキップ

`createBlockQuoteDepth()`でネスト深さを管理し、`isInside()`で引用配下かを判定する。
`skipBlockQuote`オプションを持たせ、既定値は`true`にする。

```ts
const blockQuote = createBlockQuoteDepth();
return {
  [Syntax.BlockQuote]: blockQuote.enter,
  [Syntax.BlockQuoteExit]: blockQuote.exit,
  [Syntax.Paragraph](node) {
    if (skipBlockQuote && blockQuote.isInside()) {
      return;
    }
    // ...
  },
};
```

## マークアップを除いた本文での判定

`toMaskedStringSource(node, extraMask?)`はCode・Html・Imageを同じ長さのダミー文字（`x`）へ置き換えた`StringSource`を返す。
これにより、インラインコードやコードブロックの内容を検出対象から外しつつ、隣接文字の判定では和字でない文字として扱える。

判定はマスク後のテキストで行い、報告位置は`source.originalIndexFromIndex(index)`で元の位置へ戻す。
`undefined`が返る場合は報告しない。

追加のマスクが要るときは`extraMask`を渡す。
`no-dash`はこれでオートリンク（`<https://…>`）のURLを隔離し、通常リンクの表示テキストは対象に残している。

## エラーの報告

```ts
report(node, new RuleError(message, { padding: locator.range([start, end]) }));
```

`start`・`end`はハンドラーが受け取ったノードの先頭からの相対位置。
文単位に分割してから判定する場合は、分割後のノードの`range[0]`と段落の`range[0]`の差を足して段落基準へ戻す。

メッセージは何が問題かと代わりの書き方の両方を含める。

## 外部ライブラリとの型の境界

次のライブラリはtextlint 15系と異なる`@textlint/ast-node-types`を要求する。

- `sentence-splitter`
- `unist-util-map`
- `textlint-util-to-string`

構造は互換なので、境界に限って型アサーションで変換し、理由をコメントに書く。

`packages/shared`はarktypeの`Type`を直接importせず、呼び出し可能な最小の構造として受け取る。
パッケージ間で異なるarktypeインスタンスを跨いでも`instanceof`判定に依存しないため。

## テスト

`TextlintKernel`とMarkdownプラグインで実際にlintし、`messages`を検証する。

```ts
const lintWith = (options?: Options) => (text: string) => kernel
  .lintText(text, {
    ext: ".md",
    filePath: "test.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: [{ ruleId: "<rule-name>", rule, options }],
  })
  .then((result) => result.messages);
```

- `describe`にはオプションの条件を「〜のとき」の形で書く。
- `it`には`[positive]`（許容する）または`[negative]`（検出する）を付けた期待を書く。
- 検出のテストでは件数だけでなく`range`とメッセージも検証する。
- オプション検証のテストは`JSON.parse`経由で不正な値を渡す。
- この検証はcontextへ触れる前に走るため、contextはダミーでよい。

Markdownの構文（強調・リンク・テーブル・見出し・引用・コードブロック）、CRLF改行、サロゲートペアの境界は取りこぼしやすいので、ルールの性質に応じてテストを置く。
