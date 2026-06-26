# 插件开发与 npm 发布指南

本指南面向插件的开发人员，介绍如何维护、联调测试以及向 npm 组织发布 `@faceaisdk/react-native-face-sdk`。

## 1. 目录结构

```text
FaceAISDK_RN/
├── src/                             # TypeScript 对外 API 源码
├── lib/                             # 编译后的 JS/d.ts 产物 (发布核心)
├── android/                         # 原生 Android Library 工程
├── ios/                             # 原生 iOS 工程与资源
├── __tests__/                       # 单元测试
├── example/                         # 联调验证示例 App (不发布)
└── @faceaisdk/react-native-face-sdk.podspec
```

## 2. 本地开发与联调 (`example/`)

示例工程已经通过 `metro.config.js` 的 `extraNodeModules` 将包名直接解析到仓库根目录，实现免安装直接实时调试源码。

### 快捷真机运行
在根目录下可直接执行：
```sh
./auto_run.sh
```

### 手动分步运行
1. **启动 Metro 服务**：
   ```sh
   npm run start
   ```
2. **运行 Android**：
   ```sh
   npm run android
   ```
3. **运行 iOS (真机)**：
   ```sh
   npm run pods:install   # 自动处理 Ruby 4 兼容与 Xcode 15 接口校验参数
   npm run ios
   ```

---

## 3. 构建与发布流程

### 1. 代码检查与编译
发布前需要确保 TS 编译无误、单元测试及 Lint 全部通过：
```sh
npm run typecheck    # TS 类型检查
npm run build        # 编译生成 lib 产物
npm test             # 运行单元测试
```

### 2. 本地打包验证
使用 `npm pack` 在本地生成 `.tgz` 压缩包（例如 `react-native-face-ai-sdk-0.1.0.tgz`）。该文件用于检查压缩包内是否包含必须的原生目录、打包产物（`lib/`）和配置：
```sh
npm pack
```
**注意**：生成的 `.tgz` 文件仅供本地检查，**严禁提交到 Git 仓库**。项目中已通过 `.gitignore` 配置忽略所有 `*.tgz` 文件。

### 3. 正式发布
确保在官网已创建 `faceaisdk` 组织，且 `package.json` 中的版本号已递增，然后执行发布：
```sh
npm publish --access public
```
*注：由于强制 2FA 安全策略，发布时请根据终端提示或使用 `--otp=xxxxxx` 参数输入手机验证码。*

---

## 4. 开发注意事项

1. **版本规范 (SemVer)**：严格按照 `主版本号.次版本号.修订号` 进行递增（如 Bug 修复递增最后一位，新功能递增第二位）。
2. **依赖隔离**：核心库如 `react` 和 `react-native` 必须放在 `peerDependencies` 中，严禁放入 `dependencies`。
3. **原生代码变更**：修改 `ios/` 或 `android/` 原生桥接层代码后，必须引导使用者重新执行 `pod install` 并重新跑原生全量编译。
4. **Xcode 15+ 编译兼容**：对于 Swift interface 校验错误，请查阅 `example/ios/Podfile` 中对 `TensorFlowLiteSwift` 及 `RCTSwiftUI` 注入 `-no-verify-emitted-module-interface` 的处理钩子。
5. **Git 忽略与产物管理**：
   - **打包产物**：`lib/` 目录和 `npm pack` 生成的 `*.tgz` 文件应保持在 `.gitignore` 中。
   - **临时文件**：iOS 的 `DerivedData`、`Pods` 以及 Android 的 `build/`、`.gradle/` 等本地编译中间件也不应进入版本控制。
   - **Lock 文件**：根目录下的 `package-lock.json` 或 `yarn.lock` 建议忽略（以减小库体积），但 `example/` 目录下的 Lock 文件建议保留以保证 Demo 运行环境一致。
