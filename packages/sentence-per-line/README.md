# @cffnpwr/textlint-rule-sentence-per-line

1行に複数の文が含まれている状態を検出するtextlintルールです。

「一文ごとに改行し、段落は空行で区切る」という書き方を強制します。
一文一行の形式は、diffが文単位になりレビューしやすくなります。

```markdown
<!-- NG -->
一文目です。二文目です。

<!-- OK -->
一文目です。
二文目です。
```

文の境界は[sentence-splitter](https://github.com/textlint/sentence-splitter)で判定します。
かぎ括弧・括弧内の「。」や`Node.js`のような略語のピリオドでは分割しません。
読点などで折り返した1つの文が複数行にまたがることは違反になりません。

検査対象は段落のみで、リスト項目内のテキストは対象に含み、見出し、インラインコード、コードブロック内は対象外です。

1行に2文以上ある場合、2文目以降のそれぞれを報告します。

## インストール

### npm

```sh
npm install --save-dev @cffnpwr/textlint-rule-sentence-per-line
```

or

```sh
npx jsr add -D @cffnpwr/textlint-rule-sentence-per-line
```

### yarn

```sh
yarn add --dev @cffnpwr/textlint-rule-sentence-per-line
```

or

```sh
yarn dlx jsr add -D @cffnpwr/textlint-rule-sentence-per-line
```

### pnpm

```sh
pnpm add --save-dev @cffnpwr/textlint-rule-sentence-per-line
```

or

```sh
pnpm dlx jsr add -D @cffnpwr/textlint-rule-sentence-per-line
```

### Bun

```sh
bun add --dev @cffnpwr/textlint-rule-sentence-per-line
```

or

```sh
bunx jsr add -D @cffnpwr/textlint-rule-sentence-per-line
```

### Deno

```sh
deno add --dev npm:@cffnpwr/textlint-rule-sentence-per-line
```

or

```sh
deno add --dev jsr:@cffnpwr/textlint-rule-sentence-per-line
```

## 使い方

`.textlintrc.json`に追加します。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-sentence-per-line": true
  }
}
```

## オプション

```ts
interface Options {
  skipBlockQuote?: boolean;
}
```

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `skipBlockQuote` | `true` | 引用（BlockQuote）配下を検査対象から外す |

不明なオプションキーや不正な値を指定するとエラーになります。

## ライセンス

[MIT](../../LICENSE)
