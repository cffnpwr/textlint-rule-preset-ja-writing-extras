# 新しいルールパッケージの追加手順

既存のルールパッケージ（例: `packages/no-dash`）を基準に構成を揃える。

## 1. パッケージの雛形を作る

`packages/<rule-name>/`を作り、以下を置く。

### `package.json`

既存のルールパッケージから複製し、次を書き換える。

- `name`: `@cffnpwr/textlint-rule-<rule-name>`
- `version`: `jsr.json`と`.github/release-please/manifest.json`の値と一致させた初期値
- `description`: 検出内容を日本語一文で
- `repository.directory`: `packages/<rule-name>`
- `keywords`: ルールパッケージは`["textlintrule"]`

そのまま引き継ぐ項目。

- `homepage`・`bugs`・`license`・`author`・`type`
- `files`: `["dist", "LICENSE"]`
- `scripts.test`: `bun test src`
- `scripts.typecheck`: `tsc --noEmit`
- `dependencies`: `@cffnpwr/textlint-rule-preset-ja-writing-extras-shared`を`workspace:*`で
- `peerDependencies`: `textlint`を`>=15.0.0`で

`exports`・`publishConfig`・`types`・`inlinedDependencies`は`bun run build`がtsdownの設定にもとづいて生成するため、手で書かない。

### `tsconfig.json`

```json
{
  "extends": "@cffnpwr/tsconfig/bun",
  "include": ["src"]
}
```

### `jsr.json`

`name`・`version`・`license`・`exports`（`./src/index.ts`）を書く。

### `LICENSE`

`bun run license:sync`で生成する。

## 2. 実装とテストを書く

`src/index.ts`と`src/index.test.ts`を書く。
共通パターンは[ルール実装の共通パターン](rule-implementation.md)を参照する。

## 3. READMEを書く

`README.md`と`README-ja.md`の両方を、既存パッケージと同じ構成で書く。

1. パッケージ名の見出し
2. バッジ（GitHub License・npm Version・JSR Version）
3. 検出内容の説明
4. もう一方の言語のREADMEへのリンク
5. NG・OKの例をMarkdownコードブロックで
6. 検出条件の詳細
7. `## インストール`（npm・yarn・pnpm・Bun・Denoの各サブセクション）
8. `## 使い方`（`.textlintrc.json`の設定例）
9. `## オプション`
10. `## ライセンス`

## 4. プリセットへ登録する

`packages/preset-ja-writing-extras/`を更新する。

- `package.json`の`dependencies`に`workspace:*`で追加する。
- `src/index.ts`の`rules`と`rulesConfig`に追加する。
- `src/index.test.ts`の複数ルール検証の期待値（`ruleIds`の配列）へ追加する。

## 5. リリース対象へ登録する

- `.github/release-please/config.json`の`packages`にエントリを追加し、`extra-files`で`jsr.json`の`$.version`を対象にする。
- `.github/release-please/manifest.json`にパスと初期versionを追加する。

## 6. ルートのREADMEを更新する

`README.md`と`README-ja.md`のパッケージ表に、パッケージへのリンク・検出内容・npmバッジ・JSRバッジの行を追加する。

## 7. 検証する

`bun install`のあと、次を全て通す。

```sh
bun run typecheck
bun run lint
bun run test
bun run build
```

`bun run build`が`package.json`へ生成する`exports`・`publishConfig`・`types`・`inlinedDependencies`をコミットに含める。
