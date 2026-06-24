# 插件封装与 npm 发布指南

> 适用对象：希望把当前仓库整理为 **标准化 React Native 原生库仓**，并通过 `npm install` 在其它项目中复用的人。

## 改造目标

当前仓库已经从“单一 Demo 工程”演进为：

- **根目录**：可发布库 `react-native-face-ai-sdk`
- **`example/`**：示例 App / 真机联调工程

这是更接近社区常见 React Native 库仓的结构，优点是：

- 根目录专注发布
- `example/` 专注验证
- 库 API 与示例接入方式分离明确
- 未来更容易接入 CI、版本管理和 npm 发布

---

## 一、推荐目录结构

```text
FaceAISDK_RN/
├── package.json                        # 根目录：库 package
├── tsconfig.build.json                 # 根目录：库构建配置
├── src/                                # 根目录：TypeScript API
├── android/                            # 根目录：Android Library
├── ios/                                # 根目录：iOS 原生源码与资源
├── react-native-face-ai-sdk.podspec    # 根目录：iOS Podspec
├── __tests__/                          # 根目录：库测试
├── example/
│   ├── package.json                    # 示例 App package
│   ├── App.tsx                         # 示例页面
│   ├── app.json
│   ├── index.js
│   ├── metro.config.js                 # 解析本地根库
│   ├── android/                        # 示例 Android App
│   ├── ios/                            # 示例 iOS App
│   └── auto_run.sh                     # 真机自动运行脚本
├── README.md
└── 插件封装与npm发布指南.md
```

---

## 二、当前仓库已完成的标准化改造

### 1. 根目录已提升为库目录

根目录现在直接承载：

- `package.json`
- `src/`
- `android/`
- `ios/`
- `react-native-face-ai-sdk.podspec`
- `__tests__/`

这意味着后续发布时可直接在仓库根目录执行：

```sh
npm publish
```

### 2. Demo 已下沉为 `example/`

此前根目录的 RN App 已迁移到 `example/`，包括：

- `example/App.tsx`
- `example/android/`
- `example/ios/`
- `example/index.js`
- `example/app.json`
- `example/auto_run.sh`

### 3. 示例工程已通过本地库名消费根库

`example/App.tsx` 已改为：

```ts
import {faceVerify} from 'react-native-face-ai-sdk';
```

并通过 `example/metro.config.js` 把该包名映射到仓库根目录，便于本地联调。

### 4. 根目录保留示例运行代理脚本

仓库根目录仍保留：

```sh
./auto_run.sh
```

但它现在只是一个转发入口，实际执行的是：

```sh
./example/auto_run.sh
```

这样可以兼容旧使用方式，同时让示例工程保持独立。

---

## 三、为什么 `example/` 结构更合理

相较于把 RN App 放在根目录，`example/` 结构有几个明显优势：

1. **npm 发布边界更清晰**  
   根目录只保留库需要的内容，不再混入 App 入口文件。

2. **示例工程更像真实业务项目**  
   `example/` 可独立作为宿主工程来验证库接入。

3. **目录职责更明确**  
   - 根目录：发布、测试、构建
   - `example/`：运行、联调、真机验证

4. **更便于后续对接标准工具链**  
   例如：
   - `react-native-builder-bob`
   - CI 自动发包
   - `npm pack` 验证
   - 未来 New Architecture 升级

---

## 四、根目录作为库时的关键要求

### 1. 根 `package.json`

根目录 `package.json` 应承担库描述职责，包括：

- `name: react-native-face-ai-sdk`
- `main: lib/index.js`
- `types: lib/index.d.ts`
- `react-native: src/index.ts`
- `files`
- `peerDependencies`

### 2. 根目录脚本

建议保留四类脚本：

#### 库自身构建

```sh
npm run typecheck
npm run build
npm test
npm run pack
```

#### 示例工程代理

```sh
npm run start
npm run android
npm run ios
```

这些命令转发到 `example/` 执行，既方便开发，也保留了标准入口。

### 3. 根目录不要再出现 App 入口文件

迁移完成后，根目录不再承担示例应用职责，因此以下内容应位于 `example/`：

- `App.tsx`
- `app.json`
- `index.js`
- `example/android/`
- `example/ios/`

---

## 五、`example/` 工程的配置要点

### 1. Metro 需要能看到根目录源码

因为示例工程要直接引用根目录本地库，`example/metro.config.js` 需要：

- `watchFolders` 指向仓库根目录
- `extraNodeModules` 将 `react-native-face-ai-sdk` 映射到根目录
- `nodeModulesPaths` 同时包含 `example/node_modules` 与 `../node_modules`

### 2. 示例 Android 需要修正 `node_modules` 路径

把 App 移动到 `example/` 后，Android Gradle 里 React Native 相关路径不再是默认值。

例如 `example/android/settings.gradle` 需要指向：

```text
../../node_modules/@react-native/gradle-plugin
```

`example/android/app/build.gradle` 中 `react {}` 也需要显式指定：

- `root`
- `reactNativeDir`
- `codegenDir`
- `cliFile`

否则 Gradle 会继续尝试从 `example/node_modules` 寻找 React Native。

### 3. 示例 iOS 一般可继续通过上层 `node_modules` 解析

`example/ios/Podfile` 通过 `require.resolve(..., __dir__)` 可以向上解析到仓库根目录 `node_modules`，因此通常无需大改；但要确保：

- 在 `example/` 下保留 `Gemfile`
- 优先通过 `example/pod-install.sh` 执行 `pod install`

当前仓库还额外补了一个 Ruby 4 兼容层：

- `example/ruby_shims/kconv.rb`

原因是 `CFPropertyList 3.x` 仍会 `require 'kconv'`，而 Ruby 4 已移除该标准库。`example/pod-install.sh` 会自动注入这个 shim，因此比手动直接执行 `bundle exec pod install` 更稳妥。

---

## 六、示例工程当前的运行方式

### 从根目录运行

```sh
npm run start
npm run android
npm run ios
npm run pods:install
```

### 直接运行示例工程

```sh
cd example
node ../node_modules/react-native/cli.js start --config metro.config.js
```

安装 iOS Pods：

```sh
cd example
./pod-install.sh
```

### 自动运行真机脚本

```sh
./auto_run.sh
```

或：

```sh
./example/auto_run.sh
```

---

## 七、库发布流程

现在发布流程已经更接近标准库仓：

### Step 1：类型检查

```sh
npm run typecheck
```

### Step 2：构建 TS 产物

```sh
npm run build
```

### Step 3：运行库测试

```sh
npm test
```

### Step 4：打包检查

```sh
npm pack .
```

### Step 5：发布

```sh
npm publish
```

---

## 八、发布前检查清单

### 根目录（库）

- [ ] `package.json` 为库描述，而不是 App 描述
- [ ] `src/`、`android/`、`ios/`、`.podspec` 在根目录
- [ ] `files` 字段不包含 `example/`
- [ ] `npm pack .` 产物正确

### `example/`

- [ ] `App.tsx`、`index.js`、`app.json` 已迁入 `example/`
- [ ] `metro.config.js` 已能解析根目录库
- [ ] Android Gradle 路径已改为上级 `node_modules`
- [ ] `auto_run.sh` 可从 `example/` 目录运行

### 验证

- [ ] `npm run typecheck` 通过
- [ ] `npm run build` 通过
- [ ] `npm test` 通过
- [ ] `npm run example:test` 通过
- [ ] `npm pack .` 成功

---

## 九、后续建议

如果后续还要继续标准化，建议按优先级继续推进：

1. **让 `example/` 原生层真正依赖根库，而不是保留 Demo 内原生拷贝**  
   这是下一步更彻底的标准化方向。

2. **增加 CI 工作流**  
   建议加入：
   - root typecheck
   - root jest
   - example jest
   - npm pack
   - Android / iOS smoke build

3. **补充发布版本策略与 changelog**  
   例如：
   - `changeset`
   - Git tag
   - Release notes

---

## 十、一句话结论

当前仓库已经完成“**根目录作为库、`example/` 作为示例工程**”的结构升级，整体形态已明显更接近标准 React Native 原生库仓，后续可以直接围绕根目录做构建与发布，围绕 `example/` 做真机验证与联调。
