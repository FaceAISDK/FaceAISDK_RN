# Example App

`example/` 是仓库内的 React Native 示例工程，用于：

- 真机联调 FaceAISDK 能力
- 回归验证 JS API 与原生桥接是否可用
- 演示业务方实际接入方式
  
## 运行方式

首次运行如果 `example/node_modules` 不存在，也不需要手动额外处理：`npm run start`、`npm run ios`、`npm run android`、`./auto_run.sh` 和 `./pod-install.sh` 现在都会先自动检查并补齐 Example 的 JavaScript 依赖（包括本地 `@faceaisdk/react-native-face-sdk` 链接），避免 Metro 出现 `Unable to resolve module`。

在仓库根目录执行：

```sh
npm run start
npm run android
npm run ios
```

或直接在 `example/` 目录执行：

```sh
cd example
node ../node_modules/react-native/cli.js start --config metro.config.js
```

## iOS 依赖安装

```sh
cd example
./pod-install.sh
```

该脚本会自动处理：

- `vendor/bundle` 本地 gem 安装路径
- Ruby 4 环境下 `kconv` 缺失的兼容层
- `bundle exec pod install --project-directory=ios`

## 自动运行脚本

```sh
./auto_run.sh
```

仓库根目录的 `./auto_run.sh` 也会转发到这里。

## 本地库接入方式

示例工程通过 `example/metro.config.js` 将 `@faceaisdk/react-native-face-sdk` 解析到仓库根目录，因此可以直接这样写：

```ts
import {faceVerify} from '@faceaisdk/react-native-face-sdk';
```

本地联调由两层配置共同保证：

1. `example/package.json` 的 `"@faceaisdk/react-native-face-sdk": "file:.."`，让 React Native CLI、CocoaPods autolinking 和原生构建流程能在 `node_modules` 中识别到本地插件。
2. `example/metro.config.js` 默认开启本地源码别名，把 Metro 的 JS 解析直接指向仓库根目录。

如果需要验证发布包而不是本地源码，请在仓库根目录执行：

```sh
npm run release:verify
```

该命令会临时安装 `npm pack` 生成的 `.tgz` 到 `example/`，并通过 `FACE_SDK_USE_LOCAL=0` 禁用 Metro 本地源码别名。验证结束后会自动恢复本地 `file:..` 联调模式。

