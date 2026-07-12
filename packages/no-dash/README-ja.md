# @cffnpwr/textlint-rule-no-dash

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-dash?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-dash)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-no-dash)](https://jsr.io/@cffnpwr/textlint-rule-no-dash)

地の文・見出し・テーブルセルでのダッシュ（`—` `―` `–`）の使用を検出するtextlintルールです。

[README.md for English is available here](./README.md).

ダッシュによる同格・補足の挿入（`A——挿入——B`）は括弧（）に、
言い換え（`A——B`）は句点で二文に分けるか読点でつなぐ書き方を促します。

```markdown
<!-- NG -->
この機能——つまり自動保存——は便利です。
結論は明快—シンプルが最善です。

<!-- OK -->
この機能（自動保存）は便利です。
結論は明快です。シンプルが最善です。
```

enダッシュ（`–` U+2013）は、デフォルトでは両側が和字（ひらがな・カタカナ・漢字・ー・々）の場合のみ検出します。
`Curry–Howard`のような英語複合語や`1–3月`のような範囲表記は検出しません。

判定は強調・リンクなどのマークアップを除いた本文テキスト上で行います。
`**強調**–続き`のようにダッシュがマークアップ境界にある場合も、前後の本文の文字（この例では「調」と「続」）で検出条件を判定します。
インラインコード・コードブロック・HTMLタグ・画像・オートリンク（`<https://…>`）のURLは、内部のダッシュを検出しません。これらは同じ長さのダミー文字に置き換えて判定するため、隣接するダッシュの和字判定では和字でない文字として扱われます（例: `カリー–`code`です。` の enダッシュは、直後がインラインコードのため検出されません）。
`[表示テキスト](URL)`形式のリンクは、表示テキストを検出対象とし、URLは対象にしません。
連続するダッシュ（`——`等）は1つのエラーとして報告します。

## インストール

### npm

```sh
npm install --save-dev @cffnpwr/textlint-rule-no-dash
```

or

```sh
npx jsr add -D @cffnpwr/textlint-rule-no-dash
```

### yarn

```sh
yarn add --dev @cffnpwr/textlint-rule-no-dash
```

or

```sh
yarn dlx jsr add -D @cffnpwr/textlint-rule-no-dash
```

### pnpm

```sh
pnpm add --save-dev @cffnpwr/textlint-rule-no-dash
```

or

```sh
pnpm dlx jsr add -D @cffnpwr/textlint-rule-no-dash
```

### Bun

```sh
bun add --dev @cffnpwr/textlint-rule-no-dash
```

or

```sh
bunx jsr add -D @cffnpwr/textlint-rule-no-dash
```

### Deno

```sh
deno add --dev npm:@cffnpwr/textlint-rule-no-dash
```

or

```sh
deno add --dev jsr:@cffnpwr/textlint-rule-no-dash
```

## 使い方

`.textlintrc.json`に追加します。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-dash": true
  }
}
```

## オプション

```ts
type DashContext = "always" | "japanese-both" | "japanese-either";

interface Options {
  allows?: string[];
  dashes?: Partial<Record<"emDash" | "horizontalBar" | "enDash", DashContext>>;
  skipBlockQuote?: boolean;
}
```

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `allows` | `[]` | 検出を除外する文字列・パターンのリスト。[regexp-string-matcher](https://github.com/textlint/regexp-string-matcher)形式で、`"/pattern/"`による正規表現指定も可能。マッチ範囲と重なる検出はスキップされる |
| `dashes` | 下記 | 検出するダッシュと検出条件のマップ。指定した場合はデフォルト全体を上書きする（キー単位でマージしない） |
| `skipBlockQuote` | `true` | 引用（BlockQuote）配下を検査対象から外す |

`dashes`のキーと対応する文字は次の通りです。

| キー | 文字 | デフォルトの検出条件 |
| --- | --- | --- |
| `emDash` | `—` U+2014 | `always` |
| `horizontalBar` | `―` U+2015 | `always` |
| `enDash` | `–` U+2013 | `japanese-both` |

検出条件（`DashContext`）の意味は次の通りです。

| 値 | 意味 |
| --- | --- |
| `always` | 無条件に検出する |
| `japanese-both` | 直前・直後の両方が和字のときのみ検出する |
| `japanese-either` | 直前・直後の少なくとも片方が和字のときのみ検出する |

和字はひらがな・カタカナ・漢字・長音符「ー」・「々」を指します。
不明なオプションキーや不正な値を指定するとエラーになります。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-dash": {
      "allows": ["カリー–ハワード"],
      "dashes": {
        "emDash": "always",
        "horizontalBar": "always"
      }
    }
  }
}
```

## ライセンス

[MIT](./LICENSE)
