# @faceaisdk/react-native-face-sdk

FaceAISDK 人脸识别、活体检测 React Native 原生插件，支持 iOS 和 Android 双端；所有功能无需后台 API 服务即可离线运行。

> ⚠️ **重要提示**：本 SDK 涉及底层硬件与原生算法，**必须使用真机测试**，模拟器无法运行。

## 安装

```sh
npm install @faceaisdk/react-native-face-sdk
```


## 功能与 API 说明

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
} from '@faceaisdk/react-native-face-sdk';
```

### 核心方法

#### 1. SDK 相机录入人脸
```ts
addFaceBySDKCamera(faceID: string, options?: { mode?: number; showConfirm?: boolean }) => Promise<FaceResult>
```
- `faceID`: 用户唯一标识
- `options`: 包含模式切换和是否展示确认弹窗。

#### 2. 人脸比对 + 活体检测
```ts
faceVerify(faceID: string, options?: FaceVerifyOptions) => Promise<FaceResult>
```
- 包含相似度阈值、活体类型、动作序列、超时时间等配置。

#### 3. 纯活体检测
```ts
livenessVerify(options?: LivenessVerifyOptions) => Promise<FaceResult>
```
- 仅检测镜头前是否为活人，不进行 1:1 比对。

---

## 统一返回结构 (`FaceResult`)

```ts
export interface FaceResult {
  code: number;         // 状态码
  msg: string;          // 提示文本
  faceID: string;       // 用户标识
  similarity: number;   // 比对相似度
  liveness: number;     // 活体检测分值
  faceFeature: string;  // 人脸特征值 (1024位)
  faceBase64: string;   // 采集到的人脸图片 Base64 字符串
}
```

### 状态码 (`code`) 说明

| Code | 含义 | Code | 含义 |
|------|------|------|------|
| **0** | 用户取消/初始化状态 | **7** | 炫彩活体成功 |
| **1** | 人脸识别比对/录入成功 | **8** | 炫彩活体失败 |
| **2** | 比对失败 (低于阈值) | **9** | 炫彩失败 (环境光过强) |
| **3** | 动作活体检测成功 | **10** | 所有活体检测完成 |
| **4** | 动作活体超时 | **11** | 静默活体检测失败 |
| **5** | 多次未检测到人脸 | **12** | 对应人脸未录入 |
| **6** | 对应人脸特征值不存在 | **13** | 镜头内出现多人脸 |


## 本地开发 / 联调模式

仓库内的 `example/` 默认使用**本地工程代码**，不是远程 npm 版本。为避免「示例工程和仓库根目录各装一份 `metro`/`react-native` 造成的双实例冲突」，采用如下精简模型：

- 示例工程**不维护自己的完整 `node_modules`**，统一复用仓库根目录的 `node_modules`（`react` / `react-native` / `metro` / `jest` 等都在根目录 `devDependencies` 中）。
- `example/node_modules` 里**只放一个软链** `@faceaisdk/react-native-face-sdk -> 仓库根目录`，用于解析 SDK 包名到本地源码。
- `example/metro.config.js` 通过 `watchFolders` + `nodeModulesPaths` 让 Metro 同时监听仓库根目录源码与根目录依赖。

上述软链与依赖检查由 `example/ensure-js-deps.sh` 自动完成，并具备**自愈能力**：如果检测到 `example/node_modules` 里出现了重复安装的 `react-native`/`metro`，会自动清理并重建软链，同时清掉 Android 旧的 autolinking 缓存。`./auto_run.sh`、`npm run start/ios/android/pods:install` 都会在执行前自动跑这一步。

> 提示：执行时若看到 npm 访问 registry，通常只是补齐仓库根目录的 React Native、Babel、Jest 等第三方依赖；SDK 本身始终指向当前仓库源码。脚本会打印实际 SDK 来源路径用于确认。

常用流程：

```sh
npm run dev:bootstrap
npm run example:bundle:ios
./auto_run.sh
npm run release:verify
npm run publish:dry-run
```

- `dev:bootstrap`：安装仓库根目录依赖，并补齐 `example/` 的本地 SDK 软链。
- `example:bundle:ios`：用本地源码模式验证 Metro 能否正常解析示例工程。
- `release:verify`：类型检查、构建、测试后生成 `.tgz`，并校验压缩包内是否包含发布必需文件（`lib/`、原生目录、podspec 等）。**不会污染** `example/` 的联调环境。
- `publish:dry-run`：发布前检查最终 npm 发布清单。

### iOS 配置

1. 进入 iOS 目录并安装 Pod 依赖：
   ```sh
   cd ios && pod install
   ```
2. 在 `Info.plist` 中添加相机权限描述：
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>我们需要访问您的相机进行人脸识别与活体检测</string>
   ```

### Android 配置

1. 确保项目的 `minSdkVersion` 至少为 **24**。
2. 在 `AndroidManifest.xml` 中声明相机权限：
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   ```


## BUG 反馈
  运行该插件有任何问题请反馈 https://github.com/FaceAISDK/FaceAISDK_RN/issues  
  邮箱📮：FaceAISDK.Service@gmail.com


