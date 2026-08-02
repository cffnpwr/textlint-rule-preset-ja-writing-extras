# @cffnpwr/textlint-rule-sentence-per-line

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-sentence-per-line?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-sentence-per-line)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-sentence-per-line)](https://jsr.io/@cffnpwr/textlint-rule-sentence-per-line)

A textlint rule that detects lines containing more than one sentence.

[日本語のREADMEはこちら](./README-ja.md)

It enforces the style of "break the line after each sentence, and separate paragraphs with blank
lines." The one-sentence-per-line format makes diffs sentence-scoped and easier to review.

```markdown
<!-- NG -->
一文目です。二文目です。

<!-- OK -->
一文目です。
二文目です。
```

Sentence boundaries are determined by
[sentence-splitter](https://github.com/textlint/sentence-splitter). It does not split on "。" inside
quotation marks or parentheses, or on the period in abbreviations such as `Node.js`. A single
sentence wrapped across multiple lines at a comma or similar is not a violation.

Only paragraphs are inspected. Text inside list items is included, while headings, inline code, and
code blocks are excluded.

When a line has two or more sentences, each sentence from the second onward is reported.

This rule supports autofixing with `textlint --fix`. Each fix inserts a line break at the sentence
boundary. Inside a list item, the continuation line is indented to match the item's own indentation,
so the fix does not fall back on
[lazy continuation](https://spec.commonmark.org/0.31.2/#list-items).

## How to Install

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

## How to Use

Add it to `.textlintrc.json`.

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-sentence-per-line": true
  }
}
```

## Options

```ts
interface Options {
  skipBlockQuote?: boolean;
}
```

| Option | Default | Description |
| --- | --- | --- |
| `skipBlockQuote` | `true` | Excludes content under quotes (BlockQuote) from inspection |

Specifying an unknown option key or an invalid value results in an error.

## License

[MIT](./LICENSE)
