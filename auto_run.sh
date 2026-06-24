#!/bin/bash

# FaceAISDK_RN 自动化运行脚本
# 适配 iOS 和 Android 真机

echo "========================================"
echo "   FaceAISDK_RN 快速运行工具"
echo "========================================"

# 1. 检查 Metro 是否运行 (简单检查 8081 端口)
if ! lsof -i:8081 > /dev/null; then
    echo "▶️  启动 Metro 服务端..."
    # 在新终端窗口启动 Metro (针对 MacOS)
    osascript -e 'tell application "Terminal" to do script "cd \"'$(pwd)'\" && npx react-native start"'
    sleep 3
fi

# 2. 运行 Android
echo -e "\n🤖 正在检测 Android 真机..."
if adb devices | grep -v "List" | grep -q "device$"; then
    echo "✅ 发现 Android 设备，准备安装..."
    npx react-native run-android
else
    echo "❌ 未发现 Android 真机，请检查 USB 调试是否开启。"
fi

# 3. 运行 iOS
echo -e "\n🍎 正在检测 iOS 真机..."
# 简单判断是否有 iPhone 连接
if system_profiler SPUSBDataType | grep -q "iPhone"; then
    echo "✅ 发现 iOS 设备，准备安装..."
    echo "ℹ️  提示：首次运行请确保已在 Xcode 中配置好 Signing & Team。"

    # 自动安装 Pods (如果需要)
    if [ ! -d "ios/Pods" ]; then
        echo "📦 安装 iOS 依赖库 (Pod install)..."
        (cd ios && pod install)
    fi

    npx react-native run-ios --device
else
    echo "❌ 未发现 iOS 真机，请通过数据线连接并点击「信任此电脑」。"
fi

echo -e "\n========================================"
echo "   任务提交完成，请在手机上查看运行结果"
echo "========================================"
