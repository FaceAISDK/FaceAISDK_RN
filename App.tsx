import React from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ColorValue,
} from 'react-native';

import {
  addFaceByImage,
  addFaceBySDKCamera,
  deleteFaceFeature,
  faceVerify,
  getFaceFeature,
  insertFaceFeature,
  isFaceAIModuleAvailable,
  livenessVerify,
  type FaceResult,
} from '@faceaisdk/react-native-face-sdk';

const DEMO_FACE_ID = 'testUser001';
const DEMO_FEATURE = '0'.repeat(1024);
const DEMO_BASE64_IMAGE = 'demo_base64_image_string';

type DemoAction = {
  title: string;
  needsCamera?: boolean;
  run: () => Promise<FaceResult>;
};

const demoActions: DemoAction[] = [
  {
    title: 'SDK 相机录入人脸',
    needsCamera: true,
    run: () => addFaceBySDKCamera(DEMO_FACE_ID, {mode: 1, showConfirm: true}),
  },
  {
    title: '人脸比对 + 活体检测',
    needsCamera: true,
    run: () =>
      faceVerify(DEMO_FACE_ID, {
        threshold: 0.83,
        livenessType: 1,
        motionTypes: '1,2,3,4,5',
        timeout: 7,
        steps: 2,
        allowMultiFaces: true,
      }),
  },
  {
    title: '活体检测',
    needsCamera: true,
    run: () =>
      livenessVerify({
        livenessType: 1,
        motionTypes: '1,2,3,4,5',
        timeout: 7,
        steps: 2,
        allowMultiFaces: true,
        showResultTips: false,
      }),
  },
  {
    title: '查询人脸特征',
    run: () => getFaceFeature(DEMO_FACE_ID),
  },
  {
    title: '同步人脸特征',
    run: () => insertFaceFeature(DEMO_FACE_ID, DEMO_FEATURE),
  },
  {
    title: '图片录入人脸',
    run: () => addFaceByImage(DEMO_FACE_ID, DEMO_BASE64_IMAGE),
  },
  {
    title: '删除人脸特征',
    run: () => deleteFaceFeature(DEMO_FACE_ID),
  },
];

async function requestCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function formatResult(result: FaceResult) {
  return [
    `code: ${result.code}`,
    `msg: ${result.msg}`,
    `faceID: ${result.faceID}`,
    `similarity: ${result.similarity}`,
    `liveness: ${result.liveness}`,
    `faceFeature 长度: ${result.faceFeature?.length ?? 0}`,
    `faceBase64 长度: ${result.faceBase64?.length ?? 0}`,
  ].join('\n');
}

function App() {
  const runDemo = async ({title, needsCamera, run}: DemoAction) => {
    if (needsCamera && !(await requestCameraPermission())) {
      Alert.alert('权限错误', '需要相机权限才能使用人脸识别功能');
      return;
    }

    try {
      Alert.alert(title, formatResult(await run()));
    } catch (error) {
      Alert.alert(title, error instanceof Error ? error.message : '未知错误');
    }
  };

  const isPluginReady = isFaceAIModuleAvailable();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>FaceAISDK RN 示例</Text>
        <StatusBadge
          color={isPluginReady ? '#34C759' : '#FF3B30'}
          text={isPluginReady ? '插件已连接' : '插件未连接'}
        />

        <ScrollView contentContainerStyle={styles.actions}>
          {demoActions.map(action => (
            <TouchableOpacity
              key={action.title}
              style={styles.button}
              activeOpacity={0.85}
              onPress={() => runDemo(action)}>
              <Text style={styles.buttonText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.footer}>FaceAISDK.Service@gmail.com</Text>
      </View>
    </SafeAreaView>
  );
}

function StatusBadge({color, text}: {color: ColorValue; text: string}) {
  return (
    <View style={[styles.badge, {backgroundColor: color}]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 20 : 20,
  },
  title: {
    color: '#222222',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  badge: {
    borderRadius: 999,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
    paddingBottom: 20,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    color: '#999999',
    fontSize: 12,
  },
});

export default App;
