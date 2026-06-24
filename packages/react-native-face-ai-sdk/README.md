# react-native-face-ai-sdk

`react-native-face-ai-sdk` 是从当前 Demo 中抽离出的可发布 React Native 原生插件目录，封装了 FaceAISDK 的离线人脸录入、人脸识别、活体检测与特征值管理能力。

## 当前目录包含内容

- `src/`：Promise 风格 TypeScript API
- `android/`：Android 原生桥接、AAR 与 Gradle 配置
- `ios/`：iOS 原生桥接、Swift 业务层、资源文件
- `react-native-face-ai-sdk.podspec`：iOS CocoaPods 描述文件

## JS API 示例

```ts
import {
  addFaceBySDKCamera,
  faceVerify,
  livenessVerify,
  getFaceFeature,
} from 'react-native-face-ai-sdk';

const enroll = async () => {
  const result = await addFaceBySDKCamera('user-001', {
    mode: 1,
    showConfirm: true,
  });

  console.log(result);
};
```

## 本地构建

```sh
npm run build
npm run typecheck
```

## 发布前检查

1. 确认 `package.json` 版本号已更新。
2. 运行 TypeScript 构建与 Demo 回归测试。
3. 检查 `android/libs/FaceSDKLib-release.aar`、`ios/Resources/`、`ios/FaceAISDK/` 是否已纳入 npm 包。
4. 在包目录下执行 `npm pack` 做产物检查。

