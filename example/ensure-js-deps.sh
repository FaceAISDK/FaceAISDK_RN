#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$ROOT_DIR/.." && pwd)"
NODE_MODULES_DIR="$ROOT_DIR/node_modules"
SDK_DIR="$NODE_MODULES_DIR/@faceaisdk/react-native-face-sdk"
INSTALL_STAMP="$NODE_MODULES_DIR/.package-lock.json"

print_sdk_source() {
  if [ -L "$SDK_DIR" ]; then
    local linked_target=""
    linked_target="$(cd "$(dirname "$SDK_DIR")" && cd "$(readlink "$SDK_DIR")" && pwd)"
    echo "🔗 当前 Example 使用本地 SDK 源码目录: $linked_target"
    return 0
  fi

  if [ -e "$SDK_DIR/package.json" ]; then
    echo "📦 当前 Example 使用已安装的 SDK 包目录: $SDK_DIR"
  fi
}

needs_install=0
reason=""

if [ ! -d "$NODE_MODULES_DIR" ]; then
  needs_install=1
  reason="缺少 example/node_modules"
elif [ ! -d "$NODE_MODULES_DIR/react-native" ]; then
  needs_install=1
  reason="缺少 react-native 依赖"
elif [ ! -e "$SDK_DIR/package.json" ]; then
  needs_install=1
  reason="缺少本地 SDK 依赖"
elif [ ! -f "$INSTALL_STAMP" ]; then
  needs_install=1
  reason="缺少安装标记文件"
elif [ "$ROOT_DIR/package.json" -nt "$INSTALL_STAMP" ] || [ "$REPO_DIR/package.json" -nt "$INSTALL_STAMP" ]; then
  needs_install=1
  reason="package.json 已更新，需要重新安装依赖"
fi

if [ "$needs_install" -eq 1 ]; then
  echo "📦 检测到 ${reason}，正在执行 npm install..."
  echo "   说明：此步骤会从 npm 下载 React Native 等第三方依赖，但 @faceaisdk/react-native-face-sdk 按 file:.. 绑定到当前仓库本地代码。"
  npm install --prefix "$ROOT_DIR" --no-fund --no-audit
  echo "✅ Example JavaScript 依赖已就绪。"
else
  echo "✅ Example JavaScript 依赖已存在，跳过 npm install。"
fi

print_sdk_source


