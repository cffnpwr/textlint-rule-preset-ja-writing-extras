# リリース・公開フロー

リリースは`.github/workflows/release-please.yaml`が`main`へのpushで自動実行する。
手動のversion更新やpublishは行わない。

## 流れ

1. **release-please**が`main`のコミットからリリースPRを作る。
   設定は`.github/release-please/config.json`、現在のversionは`.github/release-please/manifest.json`が持つ。
   `node-workspace`プラグインがworkspace間の依存を解決する。
2. リリースPRがマージされると、release-pleaseがタグとGitHub Releaseを作る。
   `config.json`の`draft: true`により、GitHub Releaseはこの時点では下書きになる。
3. **publish-npm**と**publish-jsr**がリリースされたパッケージごとにmatrixで走る。
4. 両方が成功した後に**publish-release**がGitHub Releaseの下書きを公開する。

## リリースPRでの`bun.lock`同期

`bun install`はworkspaceパッケージのversion変更を`bun.lock`へ再同期しない。
`bun pm pack`は`workspace:*`を`bun.lock`のversionで置換するため、同期しないと公開物のパッケージ間依存が前のversionを指す。

これを避けるため、リリースPRのブランチ上で`scripts/sync-lockfile-versions.sh`を実行し、差分があればbotがコミットしてpushする。
このスクリプトは各`packages/*/package.json`の`name`と`version`を読み、`bun.lock`のworkspacesエントリのversionを合わせる。

## npmへの公開

1. リリース対象のshaをcheckoutする。
2. `bun install --frozen-lockfile`のあと`bun run build`する。
3. `.github/actions/wait-for-workspace-deps`が、そのパッケージの`workspace:*`依存が該当versionでnpmに現れるまで待つ（10秒間隔で最大30回）。
4. `jq`で`package.json`の`exports`を`publishConfig.exports`で置き換え、`publishConfig`を削除する。
5. `bun pm pack`でtarballを作り、`npm publish --access public --provenance`で公開する。

## JSRへの公開

1. リリース対象のshaをcheckoutする。
2. `bun install --frozen-lockfile`する。
3. workspace依存の公開を待つ。
4. `bunx jsr publish`で公開する。

`jsr.json`の`exports`が`src/index.ts`を指すため、publish-jsrジョブは`bun run build`を実行しない。

## 認証

publishの2ジョブは`id-token: write`を持つ。
npmトークン等の長期シークレットは環境変数に置いていない。
release-pleaseとGitHub Releaseの公開はGitHub Appトークン（リポジトリ変数`RELEASE_CLIENT_ID`・シークレット`RELEASE_PRIVATE_KEY`）を使う。
