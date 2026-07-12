# textlint-rule-preset-ja-writing-extras

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)

日本語文章向けの追加[textlint](https://textlint.org/)ルールと、それらを束ねたプリセットのモノレポです。

既存の日本語向けプリセットが扱わない書き方の検査を提供します。
地の文でのダッシュの禁止、一文一行の強制、段落内の任意位置での改行の制限、累加の接続詞の連打の検出が対象です。
プリセットでまとめて有効化するか、単体のルールパッケージを個別に導入できます。

[English README](./README.md)

## パッケージ

| パッケージ | 検出内容 | npm | JSR |
| --- | --- | --- | --- |
| [preset-ja-writing-extras](./packages/preset-ja-writing-extras) | 下記ルールを束ねたプリセット | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-preset-ja-writing-extras?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-preset-ja-writing-extras) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-preset-ja-writing-extras)](https://jsr.io/@cffnpwr/textlint-rule-preset-ja-writing-extras) |
| [no-dash](./packages/no-dash) | 地の文・見出し・テーブルセルでのダッシュ（`—` `―` `–`）の使用 | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-dash?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-dash) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-no-dash)](https://jsr.io/@cffnpwr/textlint-rule-no-dash) |
| [sentence-per-line](./packages/sentence-per-line) | 1行に複数の文が含まれている状態 | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-sentence-per-line?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-sentence-per-line) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-sentence-per-line)](https://jsr.io/@cffnpwr/textlint-rule-sentence-per-line) |
| [no-arbitrary-line-break](./packages/no-arbitrary-line-break) | 許可された記号の直後以外での段落内の改行 | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-arbitrary-line-break?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-arbitrary-line-break) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-no-arbitrary-line-break)](https://jsr.io/@cffnpwr/textlint-rule-no-arbitrary-line-break) |
| [no-doubled-additive-conjunction](./packages/no-doubled-additive-conjunction) | 同一段落内での累加の接続詞（さらに・また・加えて）の複数回使用 | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-doubled-additive-conjunction?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-doubled-additive-conjunction) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)](https://jsr.io/@cffnpwr/textlint-rule-no-doubled-additive-conjunction) |
| [shared](./packages/shared) | 各ルールが共有する内部ユーティリティ（単体利用は想定しない） | [![npm](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-preset-ja-writing-extras-shared?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared) | [![JSR](https://jsr.io/badges/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared)](https://jsr.io/@cffnpwr/textlint-rule-preset-ja-writing-extras-shared) |

各ルールの検出条件・オプションの詳細は、それぞれのREADMEを参照してください。

## ライセンス

[MIT](./LICENSE)
