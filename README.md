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
| 切换摄像头 | - | ✅ |
| 跳转原生FaceAI导航页面 | ✅ | ✅ |

## 人脸识别/活体检测状态码

| Code | 含义 |
|------|------|
| 0 | 初始化状态，流程没有开始 |
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
├── App.tsx                      # RN 主页面（区分平台展示）
├── android/
│   └── app/src/main/java/com/facern/
│       ├── MainActivity.kt       # Android 主 Activity
│       ├── MainApplication.kt    # 注册 FaceRNPackage
│       ├── FaceRNModule.kt       # FaceAISDK 原生桥接模块
│       └── FaceRNPackage.kt      # React Native Package 注册
├── ios/
│   ├── FaceRNModule.m            # iOS 原生桥接模块
│   ├── FaceImportController.swift
│   ├── MyViewController.m        # iOS 演示页面
│   └── ...
```

## 环境要求

- React Native 0.79+
- iOS 13.0+
- Android minSdkVersion 24

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
```

## Android 集成说明

Android 端通过 React Native Native Module 桥接调用 FaceAISDK，主要依赖：

```groovy
implementation("io.github.faceaisdk:Android:2026.05.27.search")
implementation("com.tencent:mmkv:1.3.14")
```

### 桥接模块方法

`FaceRNModule` 对外暴露以下方法供 JS 层调用：

| 方法 | 说明 |
|------|------|
| `addFaceBySDKCamera(faceID, mode, showConfirm, callback)` | SDK相机录入人脸 |
| `faceVerify(faceID, threshold, livenessType, motionTypes, timeout, steps, allowMulti, callback)` | 1:1人脸识别+活体检测 |
| `livenessVerify(livenessType, motionTypes, timeout, steps, allowMulti, callback)` | 活体检测 |
| `getFaceFeature(faceID, callback)` | 查询本地人脸特征 |
| `insertFaceFeature(faceID, faceFeature, callback)` | 同步人脸特征 |
| `addFaceBySDKImage(faceID, base64Image, callback)` | 图片录入人脸 |
| `deleteFaceFeature(faceID, callback)` | 删除人脸特征 |
| `switchCamera(cameraID)` | 切换摄像头(0前置/1后置) |
| `openFaceAIActivity()` | 跳转原生FaceAI导航页 |

### 回调结果 (ResultJSON)

```json
{
  "code": 1,
  "msg": "操作成功",
  "faceID": "yourFaceID",
  "similarity": 0.92,
  "liveness": 0.99,
  "faceFeature": "1024 length string",
  "faceBase64": "base64 encoded face image"
}
```

## iOS 集成说明

iOS 端通过 `FaceRNModule` (Objective-C) 桥接调用 FaceAISDK_Core (Swift)。使用 CocoaPods 管理依赖。

## 参考

- [FaceAISDK Android](https://github.com/FaceAISDK/FaceAISDK_Android)
- [FaceAISDK iOS](https://github.com/FaceAISDK/FaceAISDK_iOS)
- [FaceAISDK UniApp UTS 插件](https://github.com/FaceAISDK/FaceAISDK_uniapp_UTS)

## License

Powered by FaceAISDK Copyright©2026
