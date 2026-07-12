import { StringSource } from "textlint-util-to-string";
import { map } from "unist-util-map";

// arktypeのTypeを直接importせず、呼び出し可能な最小の構造として受け取る。
// これによりパッケージ間で異なるarktypeインスタンスを跨いでもinstanceof判定に依存しない
type OptionsSchema = (data: unknown) => unknown;

type ArkError = { path: readonly PropertyKey[]; };
type ArkErrors = Iterable<ArkError> & { summary: string; };

// arktypeの検証結果がエラー集合か判定する。ArkErrorsは反復可能でsummaryを持ち、
// ルールのオプションは常にオブジェクトのため正常値はこの条件を満たさない
const isArkErrors = (result: unknown): result is ArkErrors => typeof result === "object"
  && result !== null
  && typeof (result as { summary?: unknown; }).summary === "string"
  && typeof (result as { [Symbol.iterator]?: unknown; })[Symbol.iterator] === "function";

// 検証エラーから日本語メッセージを組み立てる。個々のエラーのpath（キー配列。arktypeの安定API）
// のみを使い、英語のsummaryには依存しない
const formatOptionsError = (errors: ArkErrors): string => {
  const keys = [...new Set([...errors].map((error) => error.path.join(".")).filter((path) => path.length > 0))];
  if (keys.length === 0) {
    return "オプションが不正です。オブジェクトで指定してください。";
  }
  return `オプションが不正です。${keys.map((key) => `「${key}」`).join("、")}のキーまたは値を確認してください。`;
};

// arktypeスキーマでoptionsを検証し、失敗時は日本語のTypeErrorを投げる。
// schemaは各パッケージが自身のarktypeで生成したものを渡す
export const validateOptions = (schema: OptionsSchema, options: unknown): void => {
  const result = schema(options);
  if (isArkErrors(result)) {
    throw new TypeError(formatOptionsError(result));
  }
};

// BlockQuoteのネスト深さを管理する。ルールのハンドラにenter/exitを割り当て、
// isInsideで引用配下かどうかを判定する
export const createBlockQuoteDepth = () => {
  let depth = 0;
  return {
    enter: (): void => {
      depth += 1;
    },
    exit: (): void => {
      depth -= 1;
    },
    isInside: (): boolean => depth > 0,
  };
};

// 本文テキスト化の際に同一長のダミー文字列へ置き換え、判定から隔離するノード型
const maskedNodeTypes = new Set(["Code", "Html", "Image"]);

// 長さlengthのダミー文字列を返す（最低1文字）
export const maskValue = (length: number): string => "x".repeat(Math.max(length, 1));

type UnistNode = { type: string; [key: string]: unknown; };

// 追加のマスク判定。マスクする場合は置換後ノードを、しない場合はundefinedを返す
type MaskExtra = (node: UnistNode, parent: UnistNode | null | undefined) => UnistNode | undefined;

// unist-util-mapとtextlint-util-to-string 3.3.4はtextlint 15系と異なる型定義
// （unist・@textlint/ast-node-types@13）を要求するため、そのままでは渡せない（構造は互換）。
// 外部ライブラリとの境界に限りアサーションで変換する。
export const toMaskedStringSource = (node: unknown, extraMask?: MaskExtra): StringSource => {
  const masked = map(node as Parameters<typeof map>[0], (child, _index, parent) => {
    if (maskedNodeTypes.has(child.type)) {
      const length = "value" in child && typeof child.value === "string" ? child.value.length : 1;
      return { ...child, type: "Str", value: maskValue(length) };
    }
    const extra = extraMask?.(child as UnistNode, parent as UnistNode | null | undefined);
    if (extra !== undefined) {
      return extra;
    }
    return child;
  });
  return new StringSource(masked as unknown as ConstructorParameters<typeof StringSource>[0]);
};
