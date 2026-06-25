# react-native-face-sdk

FaceAISDK 人脸识别、活体检测 React Native 原生插件仓库，支持 iOS 和 Android 双端，所有功能无需后台 API 服务即可离线运行。

当前仓库已调整为更接近标准 RN 库仓的结构：

- **根目录**：可发布插件 `react-native-face-sdk`
- **`example/`**：示例 App / 真机联调工程

> **说明**：人脸识别、活体检测等功能需要摄像头，必须使用真机，不能在模拟器中验证。

## 安装

```sh
npm install react-native-face-sdk
```

### iOS

在您的 iOS 工程目录下运行：

```sh
cd ios
pod install
```

> **注意**：由于使用了人脸识别 SDK，您需要在 `Info.plist` 中添加相机权限描述：
> ```xml
> <key>NSCameraUsageDescription</key>
> <string>我们需要访问您的相机进行人脸识别</string>
> ```

### Android

1. 确保您的项目 `minSdkVersion` 至少为 24。
2. Android 端会自动完成 Autolinking。

> **注意**：由于使用了人脸识别 SDK，您需要在 `AndroidManifest.xml` 中确保有以下权限：
> ```xml
> <uses-permission android:name="android.permission.CAMERA" />
> ```

---

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

## 仓库结构

```text
FaceAISDK_RN/
├── src/                             # 插件 TypeScript 对外 API
├── android/                         # 插件 Android Library 工程
├── ios/                             # 插件 iOS 原生源码与资源
├── react-native-face-sdk.podspec # iOS Podspec
├── example/                         # 示例 App（真机调试、联调、回归）
│   ├── App.tsx
│   ├── android/
│   ├── ios/
│   └── auto_run.sh
├── __tests__/                       # 插件单元测试
├── README.md
└── 插件封装与npm发布指南.md
```

## JS API

根目录导出 Promise 风格接口：

```ts
import {
  addFaceBySDKCamera,
  faceVerify,
  livenessVerify,
  getFaceFeature,
  insertFaceFeature,
  addFaceByImage,
  deleteFaceFeature,
} from 'react-native-face-sdk';
```

统一返回结构： 

```ts
export interface FaceResult {
  code: number;
  msg: string;
  faceID: string;
  similarity: number;
  liveness: number;
  faceFeature: string;
  faceBase64: string;
}
```

## 状态码说明

| Code | 含义 |
|------|------|
| 0 | 初始化状态/用户取消 |
| 1 | 人脸识别对比成功（大于设置的 threshold） |
| 2 | 人脸识别对比失败（小于设置的 threshold） |
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

## 根目录：作为库开发/发布

### 构建与测试

```sh
npm run typecheck
npm run build
npm test
npm run pack
```

### 发布前检查

```sh
npm pack .
```

生成产物中应至少包含：

- `src/` / `lib/`
- `android/`
- `ios/`
- `react-native-face-sdk.podspec`

## `example/`：作为示例 App 运行

> 请确保已完成 [React Native 环境配置](https://reactnative.dev/docs/set-up-your-environment)。

### 方式一：使用仓库根命令

```sh
npm run start
npm run android
npm run ios
```

这些命令会自动代理到 `example/` 工程。

### 方式二：直接进入 `example/`

```sh
cd example
node ../node_modules/react-native/cli.js start --config metro.config.js
```

#### Android

```sh
cd example
node ../node_modules/react-native/cli.js run-android --no-packager
```

#### iOS

```sh
cd example
./pod-install.sh
node ../node_modules/react-native/cli.js run-ios --device "您的手机名称"
```

如果您希望在仓库根目录执行，也可以直接运行：

```sh
npm run pods:install
```

`pod-install.sh` 会自动：

- 使用 `example/vendor/bundle` 安装 Ruby gems
- 注入 Ruby 4 所需的 `kconv` 兼容层
- 对 `RCTSwiftUI` / `TensorFlowLiteSwift` 注入 `-no-verify-emitted-module-interface` 兼容参数（用于 Xcode 15.x）
- 执行 `bundle exec pod install`

### 真机自动运行脚本

根目录保留了快捷入口，仍可直接执行：

```sh
./auto_run.sh
```

实际会转发到：

```sh
./example/auto_run.sh
```

## 示例工程如何消费本地库

`example/App.tsx` 使用包名方式调用本地根库：

```ts
import {faceVerify} from 'react-native-face-sdk';
```

并通过 `example/metro.config.js` 将该包名解析到仓库根目录源码，便于在本地开发时即时调试。

## 更多文档

- 插件改造与发布说明：`插件封装与npm发布指南.md`
- 示例 App 说明：`example/README.md`
