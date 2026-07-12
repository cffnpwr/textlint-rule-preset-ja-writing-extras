# @cffnpwr/textlint-rule-no-doubled-additive-conjunction

[![GitHub License](https://img.shields.io/github/license/cffnpwr/textlint-rule-preset-ja-writing-extras?style=flat)](./LICENSE)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Ftextlint-rule-no-doubled-additive-conjunction?style=flat)](https://www.npmjs.com/package/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)
[![JSR Version](https://jsr.io/badges/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)](https://jsr.io/@cffnpwr/textlint-rule-no-doubled-additive-conjunction)

A textlint rule that detects the use of additive conjunctions (「さらに」「また」「加えて」) more than
once within the same paragraph.

[日本語のREADMEはこちら](./README-ja.md)

Repeatedly firing off additive conjunctions tends to produce a structure that merely strings a list
together with conjunctions. Since paraphrasing the word (「さらに」→「また」) does not change the fact
that they are being repeated, the target words are counted together as a group.

```markdown
<!-- NG -->
また、一つ目の理由があります。
さらに、二つ目の理由もあります。

<!-- OK -->
理由は二つあります。
一つ目は〜です。
二つ目は〜です。
```

A word is counted as a conjunction only when the target word appears at the beginning of a sentence
followed by the full-width comma 「、」 (「また、」「さらに、」「加えて、」). The delimiter immediately
after it is restricted to the full-width comma 「、」; a half-width comma 「,」 or a sentence beginning
with no comma is out of scope. The same applies when the target words are swapped out via
`conjunctions`: a swapped-in word is likewise counted only in the form of "word + comma 「、」".
Different words such as 「またの機会」 or 「また聞き」, and adverbial uses within a sentence such as
「性能をさらに高める」, are out of scope. Because the sentence-beginning check is performed on text with
emphasis and other markup removed, a sentence beginning such as `**また**、` is also counted. Inline
code, HTML, and images are not included in the text used for the sentence-beginning check.

When the total number of occurrences of the target words within a paragraph reaches two or more,
each occurrence from the second one onward is reported. The first use is not reported, as it is a
legitimate usage.

The existing
[textlint-rule-no-doubled-conjunction](https://github.com/textlint-ja/textlint-rule-no-doubled-conjunction)
detects repetition of the same conjunction across adjacent sentences via morphological analysis, but
because IPAdic does not classify 「さらに」 (an adverb) or 「加えて」 (a verb + particle) as
conjunctions, it cannot handle repeated use of the additive family. This rule complements it.

## How to Install

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

## How to Use

Add it to `.textlintrc.json`.

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-doubled-additive-conjunction": true
  }
}
```

## Options

```ts
interface Options {
  conjunctions?: string[];
  skipBlockQuote?: boolean;
}
```

| Option | Default | Description |
| --- | --- | --- |
| `conjunctions` | `["さらに", "また", "加えて"]` | The list of words to count. When specified, it overrides the default |
| `skipBlockQuote` | `true` | Excludes content under quotes (BlockQuote) from inspection |

Specifying an unknown option key or an invalid value results in an error.

```json
{
  "rules": {
    "@cffnpwr/textlint-rule-no-doubled-additive-conjunction": {
      "conjunctions": ["さらに", "また", "加えて", "更に"]
    }
  }
}
```

## License

[MIT](./LICENSE)
