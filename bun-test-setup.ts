// textlint-tester detects a Mocha/Jest-style runner via `globalThis.describe`/`it`,
// but Bun's `describe`/`it` are file-scoped bindings, not real globals. Without this
// bridge, failures surface as unattributed process errors instead of a named failing test.
import { describe as describeFn, it as itFn } from "bun:test";

declare global {
  var describe: typeof describeFn;
  var it: typeof itFn;
}

globalThis.describe = describeFn;
globalThis.it = itFn;
