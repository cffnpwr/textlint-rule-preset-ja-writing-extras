# @cffnpwr/textlint-rule-preset-ja-writing-extras

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-preset-ja-writing-extras?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-preset-ja-writing-extras)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-preset-ja-writing-extras)](https://jsr.io/@cffnpwr/textlint-rule-preset-ja-writing-extras)

A preset that bundles additional textlint rules for Japanese writing.

[日本語のREADMEはこちら](./README-ja.md)

## Bundled Rules

| Rule | Detects | Default | Autofix |
| --- | --- | --- | --- |
| [no-dash](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-dash) | Use of dashes (`—` `―` `–`) in body text, headings, and table cells | Enabled | Not supported |
| [sentence-per-line](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/sentence-per-line) | Multiple sentences contained on a single line | Enabled | Supported (`--fix`) |
| [no-arbitrary-line-break](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-arbitrary-line-break) | Line breaks within a paragraph anywhere other than immediately after an allowed symbol | Enabled | Supported (`--fix`) |
| [no-doubled-additive-conjunction](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras/tree/main/packages/no-doubled-additive-conjunction) | Multiple uses of additive conjunctions (さらに・また・加えて) within the same paragraph | Enabled | Suggestions only (not applied by `--fix`) |

For details on each rule's detection conditions and options, see the respective README.

`sentence-per-line`'s fix inserts a line break at each sentence boundary, while
`no-arbitrary-line-break`'s fix removes a line break that is not immediately after an allowed
delimiter — the two fixes move in opposite directions (insert vs. remove). With the default options
they do not conflict: a sentence boundary ends with a delimiter such as `。`, and
`no-arbitrary-line-break`'s default `allowAfter` includes that delimiter, so the line break that
`sentence-per-line` inserts falls exactly where `no-arbitrary-line-break` already allows a break. If
`allowAfter` is configured without the sentence-ending delimiters, the two rules' fixes can conflict
on the same line break within a single `textlint --fix` run.

## How to Install

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

## How to Use

Add it to `.textlintrc.json`.

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-preset-ja-writing-extras": true
  }
}
```

You can also disable individual rules or specify options.

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

## License

[MIT](./LICENSE)
