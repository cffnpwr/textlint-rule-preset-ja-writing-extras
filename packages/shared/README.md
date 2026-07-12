# @cffnpwr/textlint-rule-preset-ja-writing-extras-shared

[textlint-rule-preset-ja-writing-extras](https://github.com/cffnpwr/textlint-rule-preset-ja-writing-extras)の各ルールが共有する内部ユーティリティです。

このパッケージはプリセット内部での再利用のために公開しています。単体での利用は想定していません。

## 提供する関数

| 関数 | 用途 |
| --- | --- |
| `validateOptions(schema, options)` | arktypeスキーマでオプションを検証し、失敗時に日本語プレフィックス付きの`TypeError`を投げる |
| `createBlockQuoteDepth()` | BlockQuoteのネスト深さを管理し、引用配下かどうかを判定する |
| `toMaskedStringSource(node, extraMask?)` | インラインコード・HTML・画像を同一長のダミー文字へ置き換えた`StringSource`を返す |
| `maskValue(length)` | 指定長のダミー文字列を返す |

## ライセンス

[MIT](./LICENSE)
