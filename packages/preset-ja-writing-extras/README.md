# @cffnpwr/textlint-rule-preset-ja-writing-extras

日本語文章向けの追加textlintルールを束ねたプリセットです。

## 収録ルール

| ルール | 検出内容 | デフォルト |
| --- | --- | --- |
| [no-dash](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-dash) | 地の文・見出しでのダッシュ（`—` `―` `–`）の使用 | 有効 |
| [sentence-per-line](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/sentence-per-line) | 1行に複数の文が含まれている状態 | 有効 |
| [no-arbitrary-line-break](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-arbitrary-line-break) | 許可された記号の直後以外での段落内の改行 | 有効 |
| [no-doubled-additive-conjunction](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-doubled-additive-conjunction) | 同一段落内での累加の接続詞（さらに・また・加えて）の複数回使用 | 有効 |

各ルールの検出条件・オプションの詳細はそれぞれのREADMEを参照してください。

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

[MIT](../../LICENSE)
