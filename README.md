# FaceAISDK React Native Demo

FaceAISDK 人脸识别、活体检测 React Native 演示项目，支持 iOS 和 Android 双端。所有功能无需后台API服务可完全离线运行。

## 功能列表

| 功能 | iOS | Android |
|------|-----|---------|
| SDK相机录入人脸信息 | ✅ | ✅ |
| 1:1人脸识别+活体检测 | ✅ | ✅ |
| 活体检测（动作/炫彩/静默） | ✅ | ✅ |
| 查询人脸特征信息 | ✅ | ✅ |
| 同步人脸特征信息 | ✅ | ✅ |
| 图片录入人脸信息 | ✅ | ✅ |
| 删除人脸特征信息 | ✅ | ✅ |

## 统一回调结果结构

iOS 和 Android 回调返回完全相同的数据结构，RN层无需做平台判断：

```typescript
type FaceResult = {
  code: number;       // 状态码
  msg: string;        // 状态消息
  faceID: string;     // 人脸ID
  similarity: number; // 相似度 (仅人脸识别时有值)
  liveness: number;   // 活体分数 (仅活体检测时有值)
  faceFeature: string; // 人脸特征值 (1024长度字符串)
  faceBase64: string;  // 人脸图片Base64
};
```

## 人脸识别/活体检测状态码

| Code | 含义 |
|------|------|
| 0 | 初始化状态/用户取消 |
| 1 | 人脸识别对比成功（大于设置的threshold） |
| 2 | 人脸识别对比失败（小于设置的threshold） |
| 3 | 动作活体检测成功 |
| 4 | 动作活体超时 |
| 5 | 多次没有检测到人脸 |
| 6 | 没有对应的人脸特征值 |
| 7 | 炫彩活体成功 |
| 8 | 炫彩活体失败 |
| 9 | 炫彩活体失败（光线亮度过高） |
| 10 | 所有活体检测完成 |
| 11 | 静默活体检测失败 |
| 12 | 没有录入人脸信息 |
| 13 | 多人脸出现在镜头 |

## 项目结构

```
├── App.tsx                      # RN 主页面（统一双端调用）
├── android/
│   └── app/src/main/java/com/facern/
│       ├── MainActivity.kt       # Android 主 Activity
│       ├── MainApplication.kt    # 注册 FaceRNPackage
│       ├── FaceRNModule.kt       # FaceAISDK 原生桥接模块
│       └── FaceRNPackage.kt      # React Native Package 注册
├── ios/
│   ├── FaceRNModule.h            # iOS 桥接模块头文件
│   ├── FaceRNModule.m            # iOS 原生桥接模块
│   ├── FaceSDKSwiftManager.swift # Swift 层核心管理器
│   └── ...                       # SDK 视图组件
```

## 环境要求

- React Native 0.84+
- iOS 15.0+
- Android minSdkVersion 21+
- Node.js >= 22.11.0

## Getting Started

> **Note**: 请确保已完成 [React Native 环境配置](https://reactnative.dev/docs/set-up-your-environment)。

### Step 1: 启动 Metro

```sh
npm start
```

### Step 2: 运行应用

#### Android

```sh
npm run android
```

#### iOS

```sh
bundle install
bundle exec pod install
npm run ios
npx react-native run-ios --device  运行到真机  
**iOS第一次运行如遇闪退，请执行pod update FaceAISDK_Core后重新运行**
```

## 桥接模块 API

`FaceRNModule` 对外暴露以下方法，iOS/Android 调用方式及回调结构完全一致：

| 方法 | 说明 |
|------|------|
| `addFaceBySDKCamera(faceID, mode, showConfirm, callback)` | SDK相机录入人脸 |
| `faceVerify(faceID, threshold, livenessType, motionTypes, timeout, steps, allowMulti, callback)` | 1:1人脸识别+活体检测 |
| `livenessVerify(livenessType, motionTypes, timeout, steps, allowMulti, callback)` | 活体检测 |
| `getFaceFeature(faceID, callback)` | 查询本地人脸特征 |
| `insertFaceFeature(faceID, faceFeature, callback)` | 同步人脸特征 |
| `addFaceBySDKImage(faceID, base64Image, callback)` | 图片录入人脸 |
| `deleteFaceFeature(faceID, callback)` | 删除人脸特征 |

### 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `faceID` | string | 人脸唯一标识 |
| `mode` | number | 1=快速模式 2=精确模式 |
| `showConfirm` | boolean | 是否显示确认弹窗 |
| `threshold` | number | 相似度阈值 [0.8, 0.9] |
| `livenessType` | number | 1=动作活体 2=动作+炫彩 3=炫彩 4=静默 |
| `motionTypes` | string | 动作种类: "1,2,3,4,5" (张嘴/微笑/眨眼/摇头/点头) |
| `timeout` | number | 超时时间(秒) |
| `steps` | number | 动作步骤数 |
| `allowMulti` | boolean | 是否允许多人脸 |

## Android 集成说明

Android 端通过 React Native Native Module 桥接调用 FaceAISDK，主要依赖：

```groovy
implementation("io.github.faceaisdk:Android:2026.05.29")
implementation("com.tencent:mmkv:1.3.14")
```

注：Android直接把原生Demo lib打包成AAR引进了，需要修改样式请修改原生Android代码后重新引入

## iOS 集成说明

iOS 端通过 `FaceRNModule` (Objective-C) 桥接调用 FaceAISDK_Core (Swift)。使用 CocoaPods 管理依赖。

## 参考

- [FaceAISDK Android](https://github.com/FaceAISDK/FaceAISDK_Android)
- [FaceAISDK iOS](https://github.com/FaceAISDK/FaceAISDK_iOS)
