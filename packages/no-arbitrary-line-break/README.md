# @cffnpwr/textlint-rule-no-arbitrary-line-break

許可された記号の直後以外での段落内の改行を検出するtextlintルールです。

markdownlintの`MD013`等の行長制限に合わせて文を折り返すとき、任意の位置ではなく読点・句点などの区切りの直後で改行する書き方を強制します。
区切りと無関係な位置での改行は文の見通しを悪くします。

```markdown
<!-- NG -->
この機能は長い説明が必要にな
るので途中で改行しています。

<!-- OK -->
この機能は長い説明が必要になるので、
読点の直後で改行しています。
```

ソース上の折り返し（softbreak）とハードブレイク（行末2スペース・`\`）の両方を検査します。
ハードブレイクの判定では行末の空白と`\`を無視し、その直前の文字で許可を判定します。
インライン要素（リンク・強調・インラインコード・画像・HTML要素）の内部と直後の改行は対象外です。
`[リンク](url)`や`<br>`の直後で折り返しても報告されません。
引用（BlockQuote）配下もデフォルトで対象外です。

[@cffnpwr/textlint-rule-sentence-per-line](../sentence-per-line)が「文末では必ず改行する」を強制するのに対し、本ルールは「文中で改行してよい位置」を制限します。
両方を有効にすると「改行は文末か区切り記号の直後のみ」という規律になります。

## インストール

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

## 使い方

`.textlintrc.json`に追加します。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-arbitrary-line-break": true
  }
}
```

## オプション

```ts
interface Options {
  allowAfter?: string[];
  skipBlockQuote?: boolean;
}
```

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `allowAfter` | `["、", "。", "！", "？", "」", "』", "）", "］", "】", ",", ".", "!", "?", ")", "]"]` | 直後での改行を許可する文字のリスト。各要素はUTF-16コードユニット1個分の1文字（絵文字などBMP外の文字は指定できません）。指定した場合はデフォルトを上書きする |
| `skipBlockQuote` | `true` | 引用（BlockQuote）配下を検査対象から外す |

不明なオプションキーや不正な値（`allowAfter`への2文字以上の要素を含む）を指定するとエラーになります。
`allowAfter`に空配列を指定すると、段落内のすべての改行が報告されます。

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-arbitrary-line-break": {
      "allowAfter": ["、", "。"]
    }
  }
}
```

## ライセンス

[MIT](./LICENSE)
