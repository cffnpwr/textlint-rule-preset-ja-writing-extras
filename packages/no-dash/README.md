# @cffnpwr/textlint-rule-no-dash

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-dash?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-dash)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-no-dash)](https://jsr.io/@cffnpwr/textlint-rule-no-dash)

A textlint rule that detects the use of dashes (`—` `―` `–`) in body text, headings, and table cells.

[日本語のREADMEはこちら](./README-ja.md)

It encourages rewriting appositive or supplementary insertions with dashes (`A——挿入——B`) using
parentheses（）, and rephrasings (`A——B`) either by splitting them into two sentences with a full
stop or by joining them with a comma.

```markdown
<!-- NG -->
この機能——つまり自動保存——は便利です。
結論は明快—シンプルが最善です。

<!-- OK -->
この機能（自動保存）は便利です。
結論は明快です。シンプルが最善です。
```

By default, the en dash (`–` U+2013) is detected only when both sides are Japanese characters
(hiragana, katakana, kanji, ー, 々). English compounds such as `Curry–Howard` and range notations
such as `1–3月` are not detected.

Detection is performed on the body text with markup such as emphasis and links removed. Even when a
dash sits on a markup boundary, as in `**強調**–続き`, the detection condition is judged by the
surrounding body characters (「調」 and 「続」 in this example). Inline code, code blocks, HTML tags,
images, and autolink (`<https://…>`) URLs do not have their internal dashes detected. These are
replaced with dummy characters of the same length for the judgment, so in the Japanese-character
check for adjacent dashes they are treated as non-Japanese characters (for example, the en dash in
`カリー–`code`です。` is not detected because inline code immediately follows it).
Links in the `[表示テキスト](URL)` form target the display text for detection, not the URL.
Consecutive dashes (such as `——`) are reported as a single error.

## How to Install

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

## How to Use

Add it to `.textlintrc.json`.

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-dash": true
  }
}
```

## Options

```ts
type DashContext = "always" | "japanese-both" | "japanese-either";

interface Options {
  allows?: string[];
  dashes?: Partial<Record<"emDash" | "horizontalBar" | "enDash", DashContext>>;
  skipBlockQuote?: boolean;
}
```

| Option | Default | Description |
| --- | --- | --- |
| `allows` | `[]` | A list of strings or patterns to exclude from detection. In the [regexp-string-matcher](https://github.com/textlint/regexp-string-matcher) format, regular expressions can also be specified via `"/pattern/"`. Detections overlapping a matched range are skipped |
| `dashes` | see below | A map of dashes to detect and their detection conditions. When specified, it overrides the entire default (it is not merged per key) |
| `skipBlockQuote` | `true` | Excludes content under quotes (BlockQuote) from inspection |

The keys of `dashes` and their corresponding characters are as follows.

| Key | Character | Default detection condition |
| --- | --- | --- |
| `emDash` | `—` U+2014 | `always` |
| `horizontalBar` | `―` U+2015 | `always` |
| `enDash` | `–` U+2013 | `japanese-both` |

The meanings of the detection conditions (`DashContext`) are as follows.

| Value | Meaning |
| --- | --- |
| `always` | Detects unconditionally |
| `japanese-both` | Detects only when both the preceding and following characters are Japanese |
| `japanese-either` | Detects only when at least one of the preceding and following characters is Japanese |

Japanese characters refers to hiragana, katakana, kanji, the prolonged sound mark 「ー」, and 「々」.
Specifying an unknown option key or an invalid value results in an error.

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

## License

[MIT](./LICENSE)
