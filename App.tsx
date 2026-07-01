import React from 'react';
import {
  Alert,
  NativeModules,
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
    title: 'FaceAISDK RN Demo',
    connected: 'Plugin Connected',
    disconnected: 'Plugin Disconnected',
    permissionError: 'Permission Error',
    cameraDenied: 'Camera permission is required for face recognition.',
    failed: 'Failed',
    unknownError: 'Unknown Error',
    undefinedStatus: 'Undefined Status',
    featureLength: 'faceFeature Length',
    base64Length: 'faceBase64 Length',
    enroll: 'Enroll Face via SDK Camera',
    verify: 'Face Verify + Liveness',
    liveness: 'Liveness Detection',
    query: 'Query Face Feature',
    sync: 'Sync Face Feature',
    imageEnroll: 'Enroll Face via Image',
    remove: 'Delete Face Feature',
  },
  zh: {
    title: 'FaceAISDK RN 示例',
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
    verify: '人脸比对 + 活体检测',
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

type DemoAction = {
  labelKey: LabelKey;
  needsCamera?: boolean;
  run: () => Promise<unknown>;
};

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

const demoActions: DemoAction[] = [
  {
    labelKey: 'enroll',
    needsCamera: true,
    run: () => addFaceBySDKCamera(DEMO_FACE_ID, {mode: 1, showConfirm: true}),
  },
  {
    labelKey: 'verify',
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
    labelKey: 'liveness',
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
    labelKey: 'query',
    run: () => getFaceFeature(DEMO_FACE_ID),
  },
  {
    labelKey: 'sync',
    run: () => insertFaceFeature(DEMO_FACE_ID, DEMO_FEATURE),
  },
  {
    labelKey: 'imageEnroll',
    run: () => addFaceByImage(DEMO_FACE_ID, DEMO_BASE64_IMAGE),
  },
  {
    labelKey: 'remove',
    run: () => deleteFaceFeature(DEMO_FACE_ID),
  },
];

function readSystemLocale() {
  const settings = NativeModules.SettingsManager?.settings;
  const iosLocale =
    settings?.AppleLocale ??
    (Array.isArray(settings?.AppleLanguages) ? settings.AppleLanguages[0] : '');
  const androidLocale = NativeModules.I18nManager?.localeIdentifier;
  const intlLocale =
    typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function'
      ? ''
      : Intl.DateTimeFormat().resolvedOptions().locale;

  return [iosLocale, androidLocale, intlLocale]
    .find(locale => typeof locale === 'string' && locale.length > 0)
    ?.replace('_', '-');
}

export function resolveLanguage(locale?: string): Language {
  return locale?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const language = resolveLanguage(readSystemLocale());
const t = (key: LabelKey) => labels[language][key];
const statusCodeMap =
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

  return nested && nested !== value ? toRawResult(nested) : result;
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

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function formatResult(result: FaceResult) {
  return [
    `code: ${result.code}`,
    `codeDesc: ${statusCodeMap[result.code] ?? t('undefinedStatus')}`,
    `msg: ${result.msg}`,
    `faceID: ${result.faceID}`,
    `similarity: ${result.similarity}`,
    `liveness: ${result.liveness}`,
    `${t('featureLength')}: ${result.faceFeature.length}`,
    `${t('base64Length')}: ${result.faceBase64.length}`,
  ].join('\n');
}

function App() {
  const runDemo = async ({labelKey, needsCamera, run}: DemoAction) => {
    const title = t(labelKey);

    if (needsCamera && !(await requestCameraPermission())) {
      Alert.alert(t('permissionError'), t('cameraDenied'));
      return;
    }

    try {
      Alert.alert(title, formatResult(normalizeFaceResult(await run())));
    } catch (error) {
      Alert.alert(
        `${title} ${t('failed')}`,
        error instanceof Error ? error.message : t('unknownError'),
      );
    }
  };

  const isPluginReady = isFaceAIModuleAvailable();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>{t('title')}</Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.actions}>
          {demoActions.map(action => (
            <TouchableOpacity
              key={action.labelKey}
              style={styles.button}
              activeOpacity={0.85}
              onPress={() => runDemo(action)}>
              <Text style={styles.buttonText}>{t(action.labelKey)}</Text>
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
    backgroundColor: '#F5F7FF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 20 : 20,
  },
  title: {
    color: '#121212',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  badge: {
    borderRadius: 20,
    marginBottom: 30,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  actions: {
    width: '100%',
    paddingBottom: 40,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#34C759',
    borderRadius: 14,
    paddingVertical: 12,
    width: '95%',
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  footer: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 10,
  },
});

export default App;
