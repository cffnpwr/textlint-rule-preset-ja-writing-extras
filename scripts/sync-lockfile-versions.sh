#!/usr/bin/env bash
# bun install はworkspaceパッケージの version 変更を bun.lock に再同期しないため、
# release-please が package.json を bump した後に bun.lock の workspaces エントリの
# version を package.json に合わせて明示的に更新する。
# bun pm pack は workspace:* をこの version で置換するため、これが無いと
# 公開物のパッケージ間依存が前バージョンを指す。
set -euo pipefail

cd "$(dirname "$0")/.."

for pkg in packages/*/; do
  name="$(jq -r '.name' "${pkg}package.json")"
  ver="$(jq -r '.version' "${pkg}package.json")"
  NAME="$name" VER="$ver" perl -0pi -e '
    my $name = quotemeta($ENV{NAME});
    my $ver = $ENV{VER};
    s/("name": "$name",\s*"version": ")[^"]*(")/${1}${ver}${2}/;
  ' bun.lock
done
