# Example App

`example/` 是仓库内的 React Native 示例工程，用于：

- 真机联调 FaceAISDK 能力
- 回归验证 JS API 与原生桥接是否可用
- 演示业务方实际接入方式
  
## 运行方式

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

