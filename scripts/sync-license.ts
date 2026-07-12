import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// ルートのLICENSEを単一のソースとし、各パッケージへ複製する。
// `--check`指定時は複製がルートと一致するか検証し、ドリフトがあれば異常終了する。
const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const license = readFileSync(join(rootDir, "LICENSE"), "utf8");
const packagesDir = join(rootDir, "packages");
const checkOnly = process.argv.includes("--check");

const packageDirs = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => existsSync(join(packagesDir, entry.name, "package.json")))
  .map((entry) => entry.name);

let hasDrift = false;
for (const name of packageDirs) {
  const target = join(packagesDir, name, "LICENSE");
  const current = existsSync(target) ? readFileSync(target, "utf8") : null;
  if (current === license) {
    continue;
  }
  if (checkOnly) {
    hasDrift = true;
    console.error(`LICENSE不一致: packages/${name}/LICENSE`);
    continue;
  }
  writeFileSync(target, license);
  console.log(`複製: packages/${name}/LICENSE`);
}

if (checkOnly && hasDrift) {
  console.error("ルートのLICENSEと一致しないパッケージがあります。`bun run license:sync`を実行してください。");
  process.exit(1);
}
