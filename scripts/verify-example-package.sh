#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE_DIR="$ROOT_DIR/example"
PACK_DIR="$ROOT_DIR/.build/npm-pack"
BUNDLE_OUTPUT="/tmp/facern-example-ios.release.bundle"
ASSETS_DIR="/tmp/facern-example-assets-release"
RESTORE_NEEDED=0

restore_local_example_dependency() {
  if [ "$RESTORE_NEEDED" -eq 1 ]; then
    echo "🔄 正在恢复 Example 的本地 file:.. SDK 链接..."
    npm install --prefix "$EXAMPLE_DIR" --no-fund --no-audit > /dev/null
    npm --prefix "$EXAMPLE_DIR" run ensure:deps
  fi
}

trap restore_local_example_dependency EXIT

cd "$ROOT_DIR"

echo "🔍 确认 Example 当前是本地联调模式..."
npm --prefix "$EXAMPLE_DIR" run ensure:deps

echo "📦 生成 npm 压缩包..."
rm -rf "$PACK_DIR"
mkdir -p "$PACK_DIR"
PACK_JSON="$(npm pack --json --pack-destination "$PACK_DIR")"
TGZ_FILE="$(printf '%s' "$PACK_JSON" | node -e 'const fs = require("fs"); const data = JSON.parse(fs.readFileSync(0, "utf8")); process.stdout.write(data[0].filename);')"
TGZ_PATH="$PACK_DIR/$TGZ_FILE"

echo "🧪 临时将 Example 切换为本地 .tgz 包安装模式: $TGZ_PATH"
RESTORE_NEEDED=1
npm install --prefix "$EXAMPLE_DIR" --no-save --package-lock=false --no-fund --no-audit "$TGZ_PATH"

echo "📲 禁用 Metro 本地源码别名，验证打包产物能被 Example 正常解析..."
(
  cd "$EXAMPLE_DIR"
  FACE_SDK_USE_LOCAL=0 node ../node_modules/react-native/cli.js bundle \
    --platform ios \
    --dev true \
    --entry-file index.js \
    --bundle-output "$BUNDLE_OUTPUT" \
    --assets-dest "$ASSETS_DIR" \
    --config metro.config.js \
    --reset-cache
)

echo "✅ 发布包验证通过：Example 可以解析本地生成的 .tgz 包。"

