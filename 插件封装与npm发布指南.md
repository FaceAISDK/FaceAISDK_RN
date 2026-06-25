# 插件封装与 npm 发布指南

> 适用对象：希望把当前仓库整理为 **标准化 React Native 原生库仓**，并通过 `npm install` 在其它项目中复用的人。

## 改造目标

当前仓库已经从“单一 Demo 工程”演进为：

- **根目录**：可发布库 `react-native-face-sdk`
- **`example/`**：示例 App / 真机联调工程

这是更接近社区常见 React Native 库仓的结构，优点是：

- 根目录专注发布
- `example/` 专注验证
- 库 API 与示例接入方式分离明确
  
---

## 一、发布前准备 (已优化)

为了确保插件发布后能被顺利使用，我们已经完成了以下优化：

### 1. `package.json` 完善
- 补充了 `repository`, `homepage`, `bugs` 等元数据。
- 指定了 `main` (编译后入口), `module`, `types` (TS类型), `react-native` (源码入口)。
- 完善了 `files` 列表，确保 `lib`, `src`, `android`, `ios`, `.podspec` 被包含在包内。
- 设置了正确的 `peerDependencies` (react, react-native)。

### 2. 协议与忽略文件
- 添加了 `LICENSE` (MIT)。
- 添加了 `.npmignore`，排除了 `example/`, `.idea/`, `__tests__/` 以及 build 目录，减少包体积并保护源码。

### 3. 构建流程
- `npm run build`: 使用 `tsconfig.build.json` 将 `src/` 下的 TS 源码编译到 `lib/` 目录。
- `npm run prepare`: 在执行 `npm publish` 或本地安装前自动运行 clean 和 build，保证 `lib/` 是最新的。

---

## 二、发布流程

### 1. 注册与登录
如果你还没有 npm 账号，请去 [npmjs.com](https://www.npmjs.com/) 注册。然后在终端执行：
```sh
npm login
```

### 2. 构建产物
在根目录执行：
```sh
npm run prepare
```
这会生成 `lib/` 目录，包含 `index.js` 和 `index.d.ts`。

### 3. 本地验证 (强烈建议)
在发布前，可以使用 `npm pack` 模拟打包过程：
```sh
npm pack
```
该命令会生成一个 `.tgz` 文件。你可以解压这个文件，检查里面的目录结构是否符合预期（应包含 `lib/`, `android/`, `ios/`, `src/`, `package.json`, `README.md`, `LICENSE`, `.podspec`）。

### 4. 正式发布
确保 `package.json` 中的 `version` 已经递增。
```sh
npm publish
```
*注：如果是作用域包（如 @yourname/sdk），请使用 `npm publish --access public`。*

---

## 三、常见问题与注意事项

### 1. 版本管理
每次发布必须修改 `version`。推荐遵循语义化版本 (SemVer)：
- `0.1.0` -> `0.1.1` (补丁/修复)
- `0.1.0` -> `0.2.0` (新功能)
- `0.1.0` -> `1.0.0` (重大更新)

### 2. 原生代码变更
如果你修改了 `ios/` 或 `android/` 下的原生代码，发布到 npm 后，使用者需要重新执行 `pod install` 并重新编译 App 才能生效。

### 3. 依赖项 (Dependencies)
- `dependencies`: 插件运行必须的库（如 `mmkv`）。
- `peerDependencies`: 宿主 App 必须提供的库（如 `react`, `react-native`）。不要把 `react-native` 放在 `dependencies` 中。

---

## 四、项目当前结构

```text
FaceAISDK_RN/
├── package.json                        # 根目录：库 package
├── tsconfig.build.json                 # 根目录：库构建配置
├── src/                                # 根目录：TypeScript 源码 (导出 API)
├── lib/                                # 根目录：编译后的 JS/DTS (发布核心)
├── android/                            # 根目录：Android Library 源码
├── ios/                                # 根目录：iOS 原生源码与资源
├── react-native-face-sdk.podspec    # 根目录：iOS Podspec (用于 autolinking)
├── example/                            # 开发调试用的示例工程 (不发布)
├── README.md                           # 库的使用说明 (面向用户)
└── LICENSE                             # 开源协议
```
