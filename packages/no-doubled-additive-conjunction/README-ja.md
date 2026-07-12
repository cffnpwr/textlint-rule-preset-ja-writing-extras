# @cffnpwr/textlint-rule-no-doubled-additive-conjunction

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-doubled-additive-conjunction?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)](https://jsr.io/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)

同一段落内での累加の接続詞（「さらに」「また」「加えて」）の複数回使用を検出するtextlintルールです。

[README.md for English is available here](./README.md).

累加の接続詞の連打は、羅列を接続詞でつないだだけの構成になりがちです。
語を言い換えても（「さらに」→「また」）連打であることは変わらないため、対象語をまとめてカウントします。

```markdown
<!-- NG -->
また、一つ目の理由があります。
さらに、二つ目の理由もあります。

<!-- OK -->
理由は二つあります。
一つ目は〜です。
二つ目は〜です。
```

接続詞としてカウントするのは、文頭に対象語＋読点「、」が現れる場合（「また、」「さらに、」「加えて、」）のみです。
直後の区切りは全角の読点「、」に限り、半角カンマ「,」や読点なしの文頭は対象外です。これは`conjunctions`で対象語を差し替えた場合も同じで、差し替えた語も「語＋読点「、」」の形でのみカウントします。
「またの機会」「また聞き」のような別語や、「性能をさらに高める」のような文中の副詞用法は対象外です。
文頭の判定は強調などのマークアップを除いたテキストで行うため、`**また**、` のような文頭もカウントします。
インラインコード・HTML・画像は文頭判定のテキストに含めません。

段落内で対象語の出現が合計2回以上になったとき、2回目以降のそれぞれを報告します。
1回目の使用は正当な用法として報告しません。

既存の[textlint-rule-no-doubled-conjunction](https://github.com/textlint-ja/textlint-rule-no-doubled-conjunction)は隣接する文での同一接続詞の反復を形態素解析で検出しますが、IPAdicでは「さらに」（副詞）「加えて」（動詞＋助詞）が接続詞と判定されないため、累加系の連打を扱えません。
本ルールはその補完です。

## インストール

### npm

```sh
npm install --save-dev @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

or

```sh
npx jsr add -D @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

### yarn

```sh
yarn add --dev @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

or

```sh
yarn dlx jsr add -D @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

### pnpm

```sh
pnpm add --save-dev @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

or

```sh
pnpm dlx jsr add -D @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

### Bun

```sh
bun add --dev @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

or

```sh
bunx jsr add -D @cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

### Deno

```sh
deno add --dev npm:@cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

or

```sh
deno add --dev jsr:@cffnpwr/textlint-rule-no-doubled-additive-conjunction
```

## 使い方

`.textlintrc.json`に追加します。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-doubled-additive-conjunction": true
  }
}
```

## オプション

```ts
interface Options {
  conjunctions?: string[];
  skipBlockQuote?: boolean;
}
```

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `conjunctions` | `["さらに", "また", "加えて"]` | カウント対象の語のリスト。指定した場合はデフォルトを上書きする |
| `skipBlockQuote` | `true` | 引用（BlockQuote）配下を検査対象から外す |

不明なオプションキーや不正な値を指定するとエラーになります。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-doubled-additive-conjunction": {
      "conjunctions": ["さらに", "また", "加えて", "更に"]
    }
  }
}
```

## ライセンス

[MIT](./LICENSE)
