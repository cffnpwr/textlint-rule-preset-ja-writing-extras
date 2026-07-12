# @cffnpwr/textlint-rule-preset-ja-writing-extras-shared

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-preset-ja-writing-extras-shared?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared)](https://jsr.io/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared)

Internal utilities shared by the rules of
[textlint-rule-preset-ja-writing-extras](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras).

[日本語のREADMEはこちら](./README-ja.md)

This package is published only for internal reuse within the preset. Standalone use is not intended.

## Exported Functions

| Function | Purpose |
| --- | --- |
| `validateOptions(schema, options)` | Validates options against an arktype schema and throws a `TypeError` with a Japanese-prefixed message on failure |
| `createBlockQuoteDepth()` | Manages BlockQuote nesting depth and determines whether the position is under a quote |
| `toMaskedStringSource(node, extraMask?)` | Returns a `StringSource` in which inline code, HTML, and images are replaced with dummy characters of the same length |
| `maskValue(length)` | Returns a dummy string of the specified length |

## License

[MIT](./LICENSE)
