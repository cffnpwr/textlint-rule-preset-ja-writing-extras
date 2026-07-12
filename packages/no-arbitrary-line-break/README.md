# @cffnpwr/textlint-rule-no-arbitrary-line-break

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-arbitrary-line-break?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-arbitrary-line-break)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-no-arbitrary-line-break)](https://jsr.io/@cffnpwr/textlint-rule-no-arbitrary-line-break)

A textlint rule that detects line breaks within a paragraph anywhere other than immediately after an
allowed symbol.

[日本語のREADMEはこちら](./README-ja.md)

When wrapping text to comply with line-length limits such as markdownlint's `MD013`, this rule
enforces breaking lines immediately after a delimiter such as a comma or period, rather than at an
arbitrary position. A line break at a position unrelated to a delimiter makes the sentence harder to
follow.

```markdown
<!-- NG -->
この機能は長い説明が必要にな
るので途中で改行しています。

<!-- OK -->
この機能は長い説明が必要になるので、
読点の直後で改行しています。
```

Both source-level wrapping (softbreak) and hard breaks (two trailing spaces or `\`) are inspected.
When judging a hard break, trailing whitespace and `\` are ignored, and the character immediately
preceding them is used to determine whether the break is allowed. Line breaks inside and immediately
after inline elements (links, emphasis, inline code, images, HTML elements) are not targeted.
Wrapping immediately after `[リンク](url)` or `<br>` is not reported. Content under a quote
(BlockQuote) is also excluded by default.

Whereas [@cffnpwr/textlint-rule-sentence-per-line](../sentence-per-line) enforces "always break at
the end of a sentence", this rule restricts "the positions where a line break is allowed within a
sentence". Enabling both establishes the discipline that "a line break is allowed only at the end of
a sentence or immediately after a delimiter symbol".

## How to Install

### npm

```sh
npm install --save-dev @cffnpwr/textlint-rule-no-arbitrary-line-break
```

or

```sh
npx jsr add -D @cffnpwr/textlint-rule-no-arbitrary-line-break
```

### yarn

```sh
yarn add --dev @cffnpwr/textlint-rule-no-arbitrary-line-break
```

or

```sh
yarn dlx jsr add -D @cffnpwr/textlint-rule-no-arbitrary-line-break
```

### pnpm

```sh
pnpm add --save-dev @cffnpwr/textlint-rule-no-arbitrary-line-break
```

or

```sh
pnpm dlx jsr add -D @cffnpwr/textlint-rule-no-arbitrary-line-break
```

### Bun

```sh
bun add --dev @cffnpwr/textlint-rule-no-arbitrary-line-break
```

or

```sh
bunx jsr add -D @cffnpwr/textlint-rule-no-arbitrary-line-break
```

### Deno

```sh
deno add --dev npm:@cffnpwr/textlint-rule-no-arbitrary-line-break
```

or

```sh
deno add --dev jsr:@cffnpwr/textlint-rule-no-arbitrary-line-break
```

## How to Use

Add it to `.textlintrc.json`.

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-arbitrary-line-break": true
  }
}
```

## Options

```ts
interface Options {
  allowAfter?: string[];
  skipBlockQuote?: boolean;
}
```

| Option | Default | Description |
| --- | --- | --- |
| `allowAfter` | `["、", "。", "！", "？", "」", "』", "）", "］", "】", ",", ".", "!", "?", ")", "]"]` | List of characters after which a line break is allowed. Each element is a single character consisting of one UTF-16 code unit (characters outside the BMP, such as emoji, cannot be specified). When specified, it overrides the default |
| `skipBlockQuote` | `true` | Excludes content under quotes (BlockQuote) from inspection |

Specifying an unknown option key or an invalid value (including an element of two or more characters
in `allowAfter`) results in an error. Specifying an empty array for `allowAfter` causes every line
break within a paragraph to be reported.

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-arbitrary-line-break": {
      "allowAfter": ["、", "。"]
    }
  }
}
```

## License

[MIT](./LICENSE)
