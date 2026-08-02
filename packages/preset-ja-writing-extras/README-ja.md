# @cffnpwr/textlint-rule-preset-ja-writing-extras

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-preset-ja-writing-extras?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-preset-ja-writing-extras)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-preset-ja-writing-extras)](https://jsr.io/@cffnpwr/textlint-rule-preset-ja-writing-extras)

日本語文章向けの追加textlintルールを束ねたプリセットです。

[README.md for English is available here](./README.md).

## 収録ルール

| ルール | 検出内容 | デフォルト | 自動修正 |
| --- | --- | --- | --- |
| [no-dash](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-dash) | 地の文・見出し・テーブルセルでのダッシュ（`—` `―` `–`）の使用 | 有効 | 非対応 |
| [sentence-per-line](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/sentence-per-line) | 1行に複数の文が含まれている状態 | 有効 | 対応（`--fix`） |
| [no-arbitrary-line-break](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-arbitrary-line-break) | 許可された記号の直後以外での段落内の改行 | 有効 | 対応（`--fix`） |
| [no-doubled-additive-conjunction](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-doubled-additive-conjunction) | 同一段落内での累加の接続詞（さらに・また・加えて）の複数回使用 | 有効 | suggestionのみ（`--fix`では適用されない） |

各ルールの検出条件・オプションの詳細はそれぞれのREADMEを参照してください。

`sentence-per-line`のfixは文の境界ごとに改行を挿入し、`no-arbitrary-line-break`のfixは許可された区切りの直後以外の改行を取り除きます。
両者は逆方向（挿入と除去）の操作ですが、既定値では競合しません。
文の境界は「。」などの区切り記号で終わり、`no-arbitrary-line-break`の既定の`allowAfter`はその区切り記号を含むため、`sentence-per-line`が挿入する改行は`no-arbitrary-line-break`が既に許可する位置に収まります。
`allowAfter`から文末の区切り記号を外した設定では、同一の`textlint --fix`の実行内で両者のfixが同じ改行に対して競合することがあります。

## インストール

### npm

```sh
npm install --save-dev @cffnpwr/textlint-rule-preset-ja-writing-extras
```

or

```sh
npx jsr add -D @cffnpwr/textlint-rule-preset-ja-writing-extras
```

### yarn

```sh
yarn add --dev @cffnpwr/textlint-rule-preset-ja-writing-extras
```

or

```sh
yarn dlx jsr add -D @cffnpwr/textlint-rule-preset-ja-writing-extras
```

### pnpm

```sh
pnpm add --save-dev @cffnpwr/textlint-rule-preset-ja-writing-extras
```

or

```sh
pnpm dlx jsr add -D @cffnpwr/textlint-rule-preset-ja-writing-extras
```

### Bun

```sh
bun add --dev @cffnpwr/textlint-rule-preset-ja-writing-extras
```

or

```sh
bunx jsr add -D @cffnpwr/textlint-rule-preset-ja-writing-extras
```

### Deno

```sh
deno add --dev npm:@cffnpwr/textlint-rule-preset-ja-writing-extras
```

or

```sh
deno add --dev jsr:@cffnpwr/textlint-rule-preset-ja-writing-extras
```

## 使い方

`.textlintrc.json`に追加します。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-preset-ja-writing-extras": true
  }
}
```

ルール単位の無効化やオプション指定もできます。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-preset-ja-writing-extras": {
      "sentence-per-line": false,
      "no-doubled-additive-conjunction": {
        "conjunctions": ["さらに", "また", "加えて", "更に"]
      }
    }
  }
}
```

## ライセンス

[MIT](./LICENSE)
