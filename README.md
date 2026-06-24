# FaceAISDK React Native Demo

FaceAISDK 人脸识别、活体检测 React Native 演示项目，支持 iOS 和 Android 双端，所有功能无需后台API服务可完全离线运行。

仓库现已拆分出一个可发布插件目录：`packages/react-native-face-ai-sdk/`。根目录继续作为 Demo App 使用，`App.tsx` 通过该插件目录暴露的 Promise 风格 API 进行调用，便于后续 npm 发布与外部项目接入。
本SDK demo需要摄像头，需要真机非模拟器运行才能查看效果

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

```text
├── App.tsx                      # RN 主页面（统一双端调用）
├── packages/
│   └── react-native-face-ai-sdk/ # 可发布 RN 原生插件目录（JS API + iOS/Android 原生代码）
├── android/                     # Android 原生工程及桥接层
├── ios/
│   ├── FaceAISDK/               # 原生 Swift 视图组件及工具 (新增)
│   ├── Resources/               # 资源文件及多语言 strings (新增)
│   ├── FaceRNModule.m           # Objective-C 桥接实现
│   ├── FaceSDKSwiftManager.swift # Swift 业务逻辑核心
│   └── FaceRN-Bridging-Header.h # 混编头文件
```

## Getting Started

> **Note**: 请确保已完成 [React Native 环境配置](https://reactnative.dev/docs/set-up-your-environment)。

**我们已经编写了自动运行脚步，只要打开开发者模式配置好信息，终端运行 ./auto_run.sh 就能运行到真机**

### Step 1: 启动 Metro

```sh
npm start
```

### Step 2: 运行应用 (需要用真机摄像头)

#### Android
```sh
npm run android
```

#### iOS
```sh
bundle install
bundle exec pod install
# 方式一：运行到真机 (如遇多设备冲突，请指定名称)
npx react-native run-ios --device "您的手机名称"

# 方式二：如果 CLI 报错 CoreDeviceError 1000，请直接用 Xcode 打开运行
# 打开 ios/FaceRN.xcworkspace -> 选择真机设备 -> 点击运行按钮
```
**需要用真机摄像头；iOS 第一次运行如遇闪退，请执行 `pod update FaceAISDK_Core` 后重新运行。**


## 桥接模块 API

`FaceRNModule` 对外暴露以下方法，iOS/Android 调用方式及回调结构完全一致：

| 方法 | 说明 |
|------|------|
| `addFaceBySDKCamera(faceID, mode, showConfirm, callback)` | SDK相机录入人脸 |
| `faceVerify(faceID, threshold, livenessType, motionTypes, timeout, steps, allowMulti, callback)` | 1:1人脸识别+活体检测 |
| `livenessVerify(livenessType, motionTypes, timeout, steps, allowMulti, showResultTips, callback)` | 活体检测 |
| `getFaceFeature(faceID, callback)` | 查询本地人脸特征 |
| `insertFaceFeature(faceID, faceFeature, callback)` | 同步人脸特征 |
| `addFaceBySDKImage(faceID, base64Image, callback)` | 图片录入人脸 |
| `deleteFaceFeature(faceID, callback)` | 删除人脸特征 |

---

## 插件目录开发与发布

- 插件目录：`packages/react-native-face-ai-sdk/`
- 插件入口：`packages/react-native-face-ai-sdk/src/index.ts`
- iOS Podspec：`packages/react-native-face-ai-sdk/react-native-face-ai-sdk.podspec`
- Android 模块：`packages/react-native-face-ai-sdk/android/`

常用命令：

```sh
npx tsc -p packages/react-native-face-ai-sdk/tsconfig.build.json
npm pack ./packages/react-native-face-ai-sdk
```

更完整的改造说明见《`插件封装与npm发布指南.md`》。 

