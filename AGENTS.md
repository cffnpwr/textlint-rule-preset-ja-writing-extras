# textlint-rule-preset-ja-writing-extras

## 概要

日本語文章向けの追加textlintルールと、それらを束ねたプリセットを提供するモノレポ。
TypeScriptで実装し、npmとJSRの両方へ公開する。
パッケージマネージャーとテストランナーはBun、ビルドはtsdown、lintはESLint（`@cffnpwr/eslint-config`）を使う。

`packages/shared`が共通ユーティリティを提供し、各ルールパッケージがそれを使い、`packages/preset-ja-writing-extras`が全ルールを束ねる。

## コマンド

- ビルド: `bun run build`
- テスト: `bun run test`
- 型チェック: `bun run typecheck`
- lint: `bun run lint`
- lintの自動修正: `bun run lint:fix`
- LICENSEの同期: `bun run license:sync`（検証のみは`bun run license:check`）

CIは`bun run typecheck`・`bun run lint`・`bun run license:check`・`bun run test`を実行する。
変更後はこの4つが通る状態にする。

## ディレクトリ構成

- `packages/shared/`: 各ルールが共有する内部ユーティリティ
- `packages/no-dash/`: 地の文・見出し・テーブルセルでのダッシュを検出するルール
- `packages/sentence-per-line/`: 1行に複数の文が含まれる状態を検出するルール
- `packages/no-arbitrary-line-break/`: 段落内の任意位置での改行を検出するルール
- `packages/no-doubled-additive-conjunction/`: 段落内で累加の接続詞が重複する状態を検出するルール
- `packages/preset-ja-writing-extras/`: 上記4ルールを束ねたプリセット
- `scripts/`: LICENSEの同期と`bun.lock`のversion同期を行う運用スクリプト
- `.github/release-please/`: リリース設定とversionマニフェスト

各パッケージは実装を`src/index.ts`に、テストを`src/index.test.ts`に置く。

## 基本原則

- 検出漏れと誤検出が両立しない場面では、検出漏れを避ける側を選ぶ。
- versionはrelease-pleaseが管理するため、既存パッケージのversionを手で書き換えない。
- LICENSEはルートを単一のソースとし、複製先の`packages/*/LICENSE`は直接編集せず`bun run license:sync`で更新する。
- `packages/*/dist/`はtsdownの生成物なので編集しない。
- `package.json`の`exports`・`publishConfig`・`types`・`inlinedDependencies`もtsdownが`bun run build`で生成するため、手で書き換えない。
- 依存を追加するときは`bunfig.toml`の`minimumReleaseAge`（公開から3日）に従い、回避しない。
- `README.md`と`README-ja.md`は常に両方を同時に更新する。
- コミットメッセージとPRタイトルはConventional Commitsに従う（CIのcommitlintとsemantic PR titleが検証する）。

## コーディング規約

- フォーマットと命名はESLint（`@cffnpwr/eslint-config`）と`.editorconfig`の設定に従い、`bun run lint:fix`で整える。
- ルールの実装では`packages/shared`の共通ユーティリティを使い、パッケージごとに同じ処理を再実装しない。
- ルールのエラーメッセージは日本語で書き、何が問題かと代わりの書き方を示す。
- コメントは日本語で書き、コードを読めば分かることではなくその判断を選んだ理由を記す。
- テストは`bun:test`で書き、`describe`に条件を、`it`に`[positive]`または`[negative]`を付けた期待を書く。
- ドキュメントは既存の記述に合わせ、一文一行で書く。

## 詳細手順

- [新しいルールパッケージの追加手順](.agents/docs/new-rule.md)
- [リリース・公開フロー](.agents/docs/release.md)
- [ルール実装の共通パターン](.agents/docs/rule-implementation.md)
