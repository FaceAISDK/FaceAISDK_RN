import React from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  FACE_AI_STATUS_CODE_MAP,
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

const labels = {
  en: {
    title: 'RN FaceSDK API Demo',
    connected: 'Plugin Connected',
    disconnected: 'Plugin Disconnected',
    permissionError: 'Permission Error',
    cameraDenied: 'Camera permission is required for face recognition.',
    failed: ' Failed',
    unknownError: 'Unknown Error',
    undefinedStatus: 'Undefined Status',
    featureLength: 'faceFeature Length',
    base64Length: 'faceBase64 Length',
    enroll: 'Enroll Face via SDK Camera',
    verify: 'Face Verify + Liveness',
    liveness: 'Liveness Detection',
    query: 'Query Face Feature Info',
    sync: 'Sync Face Feature Info',
    imageEnroll: 'Enroll Face via Image',
    remove: 'Delete Face Feature Info',
  },
  zh: {
    title: 'RN FaceSDK API Demo',
    connected: '插件已连接',
    disconnected: '插件未连接',
    permissionError: '权限错误',
    cameraDenied: '需要相机权限才能使用人脸识别功能',
    failed: '失败',
    unknownError: '未知错误',
    undefinedStatus: '未定义状态',
    featureLength: 'faceFeature 长度',
    base64Length: 'faceBase64 长度',
    enroll: 'SDK 相机录入人脸',
    verify: '人脸识别 + 活体检测',
    liveness: '活体检测',
    query: '查询人脸特征',
    sync: '同步人脸特征',
    imageEnroll: '图片录入人脸',
    remove: '删除人脸特征',
  },
} as const;

type Language = keyof typeof labels;
type LabelKey = keyof (typeof labels)['en'];
type RawResult = Record<string, unknown>;

function getLanguage(): Language {
  if (typeof Intl === 'undefined') {
    return 'en';
  }

  return Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('zh')
    ? 'zh'
    : 'en';
}

const language = getLanguage();

const t = (key: LabelKey) => labels[language][key];
const FACE_AI_STATUS_CODE_MAP_EN: Record<number, string> = {
  [-1]: 'Camera permission denied',
  0: 'Initial state/user canceled',
  1: 'Face recognition or enrollment succeeded',
  2: 'Face verification failed: similarity below threshold',
  3: 'Motion liveness passed',
  4: 'Motion liveness timeout',
  5: 'No face detected repeatedly',
  6: 'No local face feature found',
  7: 'Color liveness passed',
  8: 'Color liveness failed',
  9: 'Color liveness failed: ambient light too strong',
  10: 'Liveness process completed',
  11: 'Silent liveness failed',
  12: 'No enrolled face information',
  13: 'Multiple faces detected',
};
const statusMap =
  language === 'zh' ? FACE_AI_STATUS_CODE_MAP : FACE_AI_STATUS_CODE_MAP_EN;

function toRawResult(value: unknown): RawResult {
  if (Array.isArray(value)) {
    return toRawResult(value[0]);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return {};
    }

    try {
      return toRawResult(JSON.parse(trimmed));
    } catch {
      return {msg: trimmed};
    }
  }

  if (!value || typeof value !== 'object') {
    return {};
  }

  const result = value as RawResult;
  const nested = result.result ?? result.data ?? result.payload;

  if (nested && nested !== value) {
    return toRawResult(nested);
  }

  return result;
}

function readNumber(result: RawResult, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = result[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const numberValue = Number(value);

      if (Number.isFinite(numberValue)) {
        return numberValue;
      }
    }
  }

  return fallback;
}

function readString(result: RawResult, keys: string[]) {
  for (const key of keys) {
    const value = result[key];

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
  }

  return '';
}

export function normalizeFaceResult(value: unknown): FaceResult {
  const result = toRawResult(value);

  return {
    code: readNumber(result, ['code', 'resultCode', 'statusCode', 'Code']),
    msg: readString(result, ['msg', 'message', 'error', 'reason', 'Msg']),
    faceID: readString(result, ['faceID', 'faceId', 'face_id', 'userFaceID']),
    similarity: readNumber(result, ['similarity', 'score']),
    liveness: readNumber(result, ['liveness', 'livenessScore']),
    faceFeature: readString(result, ['faceFeature', 'feature']),
    faceBase64: readString(result, ['faceBase64', 'base64', 'imageBase64']),
  };
}

async function requestCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

function showResult(title: string, result: FaceResult) {
  Alert.alert(
    title,
    [
      `code: ${result.code}`,
      `codeDesc: ${statusMap[result.code] ?? t('undefinedStatus')}`,
      `msg: ${result.msg}`,
      `faceID: ${result.faceID}`,
      `similarity: ${result.similarity}`,
      `liveness: ${result.liveness}`,
      `${t('featureLength')}: ${result.faceFeature?.length ?? 0}`,
      `${t('base64Length')}: ${result.faceBase64?.length ?? 0}`,
    ].join('\n'),
  );
}

function App() {
  const runAction = async (
    title: string,
    action: () => Promise<unknown>,
    needsCamera = true,
  ) => {
    if (needsCamera && !(await requestCameraPermission())) {
      Alert.alert(t('permissionError'), t('cameraDenied'));
      return;
    }

    try {
      showResult(title, normalizeFaceResult(await action()));
    } catch (error) {
      Alert.alert(
        `${title}${t('failed')}`,
        error instanceof Error ? error.message : t('unknownError'),
      );
    }
  };

  const actions = [
    {
      label: t('enroll'),
      run: () =>
        addFaceBySDKCamera(DEMO_FACE_ID, {mode: 1, showConfirm: true}),
    },
    {
      label: t('verify'),
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
      label: t('liveness'),
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
      label: t('query'),
      run: () => getFaceFeature(DEMO_FACE_ID),
      needsCamera: false,
    },
    {
      label: t('sync'),
      run: () => insertFaceFeature(DEMO_FACE_ID, DEMO_FEATURE),
      needsCamera: false,
    },
    {
      label: t('imageEnroll'),
      run: () => addFaceByImage(DEMO_FACE_ID, DEMO_BASE64_IMAGE),
      needsCamera: false,
    },
    {
      label: t('remove'),
      run: () => deleteFaceFeature(DEMO_FACE_ID),
      needsCamera: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.title}>{t('title')}</Text>
        <Text style={styles.subtitle}>
          {Platform.OS} ·{' '}
          {isFaceAIModuleAvailable() ? t('connected') : t('disconnected')}
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {actions.map(({label, run, needsCamera}) => (
            <TouchableOpacity
              key={label}
              style={styles.button}
              onPress={() => runAction(label, run, needsCamera)}>
              <Text style={styles.buttonText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.footer}>Email: FaceAISDK.Service@gmail.com</Text>
      </View>
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 10 : 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#34C759',
    borderRadius: 8,
    marginVertical: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#999999',
    marginTop: 10,
  },
});

export default App;
