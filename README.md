# @faceaisdk/react-native-face-sdk

FaceAISDK 人脸识别、活体检测 React Native 原生插件，支持 iOS 和 Android 双端；所有功能无需后台 API 服务即可离线运行。

> ⚠️ **重要提示**：本 SDK 涉及底层硬件与原生算法，**必须使用真机测试**，模拟器无法运行。

## 安装

```sh
npm install @faceaisdk/react-native-face-sdk
```

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

---

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

---

## 贡献与本地开发

关于本地二次开发、本地示例工程运行、混合调试以及完整的 npm 发布流程，请参考开发说明文档：[插件封装与npm发布指南.md](./插件封装与npm发布指南.md)。


