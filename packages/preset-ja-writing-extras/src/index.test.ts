import { describe, expect, it } from "bun:test";

import type { TextlintKernelRule } from "@textlint/kernel";

import { TextlintKernel } from "@textlint/kernel";
import markdown from "@textlint/textlint-plugin-markdown";

import preset from "./index.ts";

const kernel = new TextlintKernel();

// Given: プリセットの全ルールをrulesConfigのデフォルト設定で有効化する
// （textlintがプリセットを展開するのと同じ形にする）
const presetRules: TextlintKernelRule[] = Object.entries(preset.rules).map(([ruleId, rule]) => ({
  ruleId,
  rule,
  options: preset.rulesConfig[ruleId as keyof typeof preset.rulesConfig],
}));

// When: テキストをlintした結果のメッセージを返す
const lint = (text: string) => kernel
  .lintText(text, {
    ext: ".md",
    filePath: "test.md",
    plugins: [{ pluginId: "markdown", plugin: markdown }],
    rules: presetRules,
  })
  .then((result) => result.messages);

describe("preset-ja-writing-extras", () => {
  it("[positive] 規約に沿った文書にはエラーを報告しない", async () => {
    const messages = await lint(
      "これは正しい一文です。\n読点の後で、\n折り返した文も正しい書き方です。\n\nまた、接続詞は段落内1回なら問題ありません。\n",
    );
    expect(messages).toHaveLength(0);
  });

  it("[negative] 4ルールの違反を含む文書で、各ルールがエラーを報告する", async () => {
    const messages = await lint(
      "これはダッシュ——を含む文です。一行に二文もあります。\n\nまた、一つ目の理由です。\n文の途中\nで改行しています。\nまた、二つ目の理由です。\n",
    );
    const ruleIds = messages.map((message) => message.ruleId).sort();
    expect(ruleIds).toEqual([
      "no-arbitrary-line-break",
      "no-dash",
      "no-doubled-additive-conjunction",
      "sentence-per-line",
    ]);
  });
});
