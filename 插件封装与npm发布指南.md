# 插件封装与 npm 发布指南

> 适用对象：希望把当前 `FaceAISDK_RN` Demo 工程整理为 **可发布的 React Native 原生插件**，并通过 `npm install` 在其它项目中复用的人。

## 改造目标

本仓库现在分为两部分：

- 根目录：`FaceAISDK_RN` Demo App，用于真机联调与功能回归
- `packages/react-native-face-ai-sdk/`：可发布插件目录，包含：
  - `src/`：TypeScript 对外 API
  - `android/`：Android 原生桥接与依赖
  - `ios/`：iOS 原生桥接、Swift 业务层、资源文件
  - `react-native-face-ai-sdk.podspec`：iOS Pod 配置

也就是说，当前仓库已从“只有 Demo”改造成“**Demo + 插件源码同仓维护**”的形态。

---

## 一、推荐目录结构

```text
FaceAISDK_RN/
├── App.tsx                                  # Demo 入口，调用插件公开 API
├── android/                                 # Demo Android 工程
├── ios/                                     # Demo iOS 工程
├── packages/
│   └── react-native-face-ai-sdk/
│       ├── package.json                     # 插件 npm 元数据
│       ├── tsconfig.build.json              # 插件 TS 构建配置
│       ├── README.md                        # 插件独立说明
│       ├── react-native-face-ai-sdk.podspec # iOS CocoaPods 描述文件
│       ├── src/
│       │   ├── index.ts                     # Promise 风格 JS/TS API
│       │   └── types.ts                     # 对外类型定义
│       ├── android/
│       │   ├── build.gradle                 # Android Library 配置
│       │   ├── libs/
│       │   │   └── FaceSDKLib-release.aar   # 本地 AAR（如需要）
│       │   └── src/main/java/...            # 原生桥接代码
│       └── ios/
│           ├── FaceRNModule.h/.m            # RN ObjC 桥接层
│           ├── FaceSDKSwiftManager.swift    # Swift 统一管理器
│           ├── FaceAISDK/                   # SwiftUI 页面与工具类
│           └── Resources/                   # 图片、多语言资源
└── 插件封装与npm发布指南.md
```

---

## 二、为什么要这样拆分

原始 Demo 工程有两个问题：

1. `App.tsx` 直接操作 `NativeModules.FaceRNModule`，业务项目接入时缺少统一 SDK API。
2. 原生代码散落在 Demo 工程的 `android/app` 和 `ios/` 内，无法直接按 npm 包分发。

现在的改造重点是：

- **把 JS 层 API 收敛到 `packages/react-native-face-ai-sdk/src/index.ts`**
- **把 Android / iOS 原生代码集中到插件目录**
- **让 Demo 反向依赖插件公开 API，而不是直接依赖原生模块**

这样做以后：

- Demo 继续承担联调作用
- 插件目录负责发布
- JS 调用方式与未来外部接入方式保持一致

---

## 三、当前仓库已经完成的改造项

### 1. 新增独立插件目录

已新增：`packages/react-native-face-ai-sdk/`

### 2. 新增 TypeScript 对外 API

已新增：

- `packages/react-native-face-ai-sdk/src/index.ts`
- `packages/react-native-face-ai-sdk/src/types.ts`

特点：

- 对外统一 Promise 风格 API
- 内部仍兼容当前原生 callback 结构
- 自动规范化返回值，避免字段缺失

### 3. Demo 改为调用插件 API

`App.tsx` 已不再直接操作 `NativeModules`，而是调用：

- `addFaceBySDKCamera()`
- `faceVerify()`
- `livenessVerify()`
- `getFaceFeature()`
- `insertFaceFeature()`
- `addFaceByImage()`
- `deleteFaceFeature()`

这一步非常关键，因为它验证了“插件对外 API”是否足够完整。

### 4. Android 插件目录已建立

已补齐：

- `packages/react-native-face-ai-sdk/android/build.gradle`
- `packages/react-native-face-ai-sdk/android/src/main/AndroidManifest.xml`
- `packages/react-native-face-ai-sdk/android/src/main/java/com/faceaisdk/reactnative/FaceRNModule.kt`
- `packages/react-native-face-ai-sdk/android/src/main/java/com/faceaisdk/reactnative/FaceRNPackage.kt`
- `packages/react-native-face-ai-sdk/android/libs/FaceSDKLib-release.aar`

### 5. iOS 插件目录已建立

已补齐：

- `packages/react-native-face-ai-sdk/react-native-face-ai-sdk.podspec`
- `packages/react-native-face-ai-sdk/ios/FaceRNModule.h`
- `packages/react-native-face-ai-sdk/ios/FaceRNModule.m`
- `packages/react-native-face-ai-sdk/ios/FaceSDKSwiftManager.swift`
- `packages/react-native-face-ai-sdk/ios/FaceColorExtensions.swift`
- `packages/react-native-face-ai-sdk/ios/FaceAISDK/`
- `packages/react-native-face-ai-sdk/ios/Resources/`

---

## 四、JS/TS 层封装规范

建议对外只暴露 Promise 风格 API，不要让业务方直接处理底层 callback。

### 示例

```ts
import {faceVerify} from 'react-native-face-ai-sdk';

const result = await faceVerify('user-001', {
  threshold: 0.83,
  livenessType: 1,
  motionTypes: '1,2,3,4,5',
  timeout: 7,
  steps: 2,
  allowMultiFaces: true,
});
```

### 已统一的返回结构

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

### 推荐做法

- JS 层做参数默认值收口
- JS 层做返回值 normalize
- JS 层保留状态码映射表，供 UI 直接展示
- 原生层尽量只负责能力实现，不承担复杂业务拼装

---

## 五、iOS 封装要点

### 1. Podspec 必须具备的内容

插件目录下的 `react-native-face-ai-sdk.podspec` 需要至少包含：

- `s.source_files`
- `s.resources`
- `s.dependency 'React-Core'`
- `s.dependency 'FaceAISDK_Core', '2026.06.21'`
- `s.dependency 'TensorFlowLiteSwift', '~> 2.14.0'`

### 2. Swift 生成头引用

原 Demo 里 `FaceRNModule.m` 使用：

```objc
#import "FaceRN-Swift.h"
```

插件化后，这个头文件名必须与 Pod Module 名保持一致。因此现在已经改为：

```objc
#import "FaceAISDKReactNative-Swift.h"
```

同时在 podspec 中声明：

```ruby
s.module_name = 'FaceAISDKReactNative'
```

### 3. 资源文件不要遗漏

必须把以下内容一起打包：

- `ios/Resources/*.png`
- `ios/Resources/**/*.lproj`
- 其它多语言资源

否则运行时会出现：

- 文案缺失
- 图片找不到
- 活体提示页资源异常

### 4. Swift / ObjC 混编建议

当前结构沿用 ObjC 导出 RN bridge、Swift 实现业务逻辑的方式：

- `FaceRNModule.m`：桥接导出
- `FaceSDKSwiftManager.swift`：能力编排
- `FaceAISDK/*.swift`：UI/识别流程/工具层

这种模式适合继续维护，不建议强行全部改成 ObjC 或全部改成 TurboModule，除非后续明确要做 New Architecture 专项升级。

---

## 六、Android 封装要点

### 1. Android Library 化

插件目录下应使用：

```gradle
apply plugin: 'com.android.library'
apply plugin: 'org.jetbrains.kotlin.android'
```

而不是 Demo App 的：

```gradle
apply plugin: 'com.android.application'
```

### 2. 原生桥接代码位置

当前插件目录使用：

```text
android/src/main/java/com/faceaisdk/reactnative/
```

建议插件发布时保持独立 namespace，例如：

- `com.faceaisdk.reactnative`

不要继续沿用 Demo 的 `com.facern`，避免与宿主 App 包名混淆。

### 3. Android 依赖

当前插件目录已显式声明：

```gradle
dependencies {
    implementation 'com.facebook.react:react-android'
    implementation fileTree(dir: 'libs', include: ['*.aar'])
    implementation 'io.github.faceaisdk:Android:2026.06.21'
    implementation 'com.tencent:mmkv:1.3.14'
}
```

如后续确认本地 `AAR` 已无必要，可在完成远程依赖验证后再删除 `android/libs/FaceSDKLib-release.aar`。

### 4. 发布前核对项

- `FaceRNModule.kt` 包名是否已切换
- `FaceRNPackage.kt` 包名是否已切换
- `build.gradle` 是否为 `library`
- `AndroidManifest.xml` 是否存在
- `consumerProguardFiles` 是否已配置

---

## 七、根目录 Demo 如何使用插件

当前 Demo 采用“**源码直连插件目录**”的方式，便于在同仓库里调试：

```ts
import {
  faceVerify,
  livenessVerify,
  addFaceBySDKCamera,
} from './packages/react-native-face-ai-sdk/src';
```

这样做的优势：

- 不需要先发布 npm 再验证 Demo
- 改完 JS API 后可以立刻在 Demo 中回归
- 更容易确认导出的 API 是否合理

等准备正式对外发布时，再让外部项目改成：

```ts
import {faceVerify} from 'react-native-face-ai-sdk';
```

---

## 八、推荐发布流程

### Step 1：构建插件 TS 产物

在仓库根目录执行：

```sh
npx tsc -p packages/react-native-face-ai-sdk/tsconfig.build.json
```

或使用根目录快捷命令：

```sh
npm run package:build
```

### Step 2：检查 npm 包内容

```sh
npm pack ./packages/react-native-face-ai-sdk
```

重点检查最终 tarball 中是否包含：

- `src/` 或 `lib/`
- `android/`
- `ios/`
- `.podspec`
- `README.md`

### Step 3：版本号管理

在 `packages/react-native-face-ai-sdk/package.json` 中提升版本，例如：

```json
{
  "version": "0.1.1"
}
```

建议遵循：

- 修复问题：patch
- 新增兼容 API：minor
- 破坏性变更：major

### Step 4：发布 npm

```sh
cd packages/react-native-face-ai-sdk
npm publish
```

如果是 scoped 包，例如 `@faceai/react-native-face-ai-sdk`，则需要：

```sh
npm publish --access public
```

---

## 九、外部项目接入说明

外部项目安装后：

```sh
npm install react-native-face-ai-sdk
```

### iOS

```sh
cd ios
pod install
```

### JS 调用

```ts
import {
  addFaceBySDKCamera,
  faceVerify,
  livenessVerify,
  getFaceFeature,
  insertFaceFeature,
  addFaceByImage,
  deleteFaceFeature,
} from 'react-native-face-ai-sdk';
```

---

## 十、发布前完整核对清单

### 文档

- [ ] 根 `README.md` 已说明 Demo / 插件双结构
- [ ] 插件 `README.md` 已说明安装、构建、发布
- [ ] 本指南内容与当前仓库结构一致

### JS/TS

- [ ] `src/index.ts` 已导出全部 API
- [ ] 类型定义完整
- [ ] 默认参数合理
- [ ] 返回值已 normalize

### Android

- [ ] `android/build.gradle` 为 library
- [ ] namespace 独立
- [ ] React Native 依赖存在
- [ ] FaceAISDK 依赖存在
- [ ] AAR/资源已纳入包体

### iOS

- [ ] podspec 存在
- [ ] `source_files` 正确
- [ ] `resources` 正确
- [ ] Swift generated header 名称已匹配 module_name
- [ ] `FaceAISDK_Core` / `TensorFlowLiteSwift` 已声明

### 验证

- [ ] TypeScript 构建通过
- [ ] Jest 测试通过
- [ ] `npm pack` 成功
- [ ] Demo App 基础渲染正常

---

## 十一、后续建议

如果后续准备长期维护并正式对外发布，建议继续做三件事：

1. **把 Demo 工程进一步下沉为 `example/`**  
   当前根目录仍是 RN App，后续可升级为标准库仓结构：根目录发包，`example/` 作为示例工程。

2. **增加自动化发布检查**  
   建议增加 CI：
   - `tsc`
   - `jest`
   - `npm pack`
   - Android/iOS smoke build

3. **评估 New Architecture 支持**  
   当前桥接方式可稳定工作；如果未来要适配更严格的新架构场景，可再补 TurboModule / Codegen 支持。

---

## 十二、一句话结论

当前仓库已经完成从“单纯 Demo 工程”到“**Demo + 可发布 RN 插件目录**”的第一阶段改造；后续只需围绕 `packages/react-native-face-ai-sdk/` 做版本管理、打包验证和 npm 发布，即可面向外部项目复用。
