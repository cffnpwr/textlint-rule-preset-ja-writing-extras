# textlint-rule-preset-ja-writing-extras

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)

A monorepo of additional [textlint](https://textlint.org/) rules for Japanese writing, plus a
preset that bundles them.

These rules cover writing-style checks that existing Japanese presets do not: banning dashes in
prose, enforcing one sentence per line, restricting arbitrary in-paragraph line breaks, and
flagging repeated additive conjunctions. Use the preset to enable them all at once, or install a
single rule package on its own.

[日本語のREADMEはこちら](./README-ja.md)

## Packages

| Package | Description | npm | JSR |
| --- | --- | --- | --- |
| [preset-ja-writing-extras](./packages/preset-ja-writing-extras) | Preset bundling the rules below | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-preset-ja-writing-extras?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-preset-ja-writing-extras) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-preset-ja-writing-extras)](https://jsr.io/@cffnpwr/textlint-rule-preset-ja-writing-extras) |
| [no-dash](./packages/no-dash) | Detects dashes (`—` `―` `–`) in prose, headings, and table cells | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-dash?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-dash) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-no-dash)](https://jsr.io/@cffnpwr/textlint-rule-no-dash) |
| [sentence-per-line](./packages/sentence-per-line) | Detects lines that contain more than one sentence | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-sentence-per-line?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-sentence-per-line) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-sentence-per-line)](https://jsr.io/@cffnpwr/textlint-rule-sentence-per-line) |
| [no-arbitrary-line-break](./packages/no-arbitrary-line-break) | Detects in-paragraph line breaks that are not right after an allowed delimiter | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-arbitrary-line-break?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-arbitrary-line-break) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-no-arbitrary-line-break)](https://jsr.io/@cffnpwr/textlint-rule-no-arbitrary-line-break) |
| [no-doubled-additive-conjunction](./packages/no-doubled-additive-conjunction) | Detects repeated additive conjunctions (さらに / また / 加えて) within a paragraph | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-doubled-additive-conjunction?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-doubled-additive-conjunction) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)](https://jsr.io/@cffnpwr/textlint-rule-no-doubled-additive-conjunction) |
| [shared](./packages/shared) | Internal utilities shared by the rules (not intended for standalone use) | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-preset-ja-writing-extras-shared?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared)](https://jsr.io/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared) |

Each package README documents its detection conditions and options.

## License

[MIT](./LICENSE)
