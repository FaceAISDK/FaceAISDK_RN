import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  ScrollView,
  SafeAreaView,
  PermissionsAndroid,
  NativeModules,
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

// --- 国际化处理 ---
const translations = {
  en: {
    title: 'RN FaceSDK API Demo',
    connected: 'Plugin Connected',
    disconnected: 'Plugin Disconnected',
    permission_error: 'Permission Error',
    camera_denied: 'Camera permission is required for face recognition.',
    enroll_title: 'Enrollment Result',
    enroll_btn: 'Enroll Face via SDK Camera',
    verify_title: 'Verification Result',
    verify_btn: 'Face Verify + Liveness',
    liveness_title: 'Liveness Result',
    liveness_btn: 'Liveness Detection',
    query_title: 'Query Feature',
    query_btn: 'Query Face Feature Info',
    sync_title: 'Sync Feature',
    sync_btn: 'Sync Face Feature Info',
    image_enroll_title: 'Image Enrollment Result',
    image_enroll_btn: 'Enroll Face via Image',
    delete_title: 'Delete Feature',
    delete_btn: 'Delete Face Feature Info',
    failed: 'Failed',
    unknown_error: 'Unknown Error',
    undefined_status: 'Undefined Status',
    feature_len: 'faceFeature Length: ',
    base64_len: 'faceBase64 Length: ',
  },
  zh: {
    title: 'RN FaceSDK API Demo',
    connected: '插件已连接',
    disconnected: '插件未连接',
    permission_error: '权限错误',
    camera_denied: '需要相机权限才能使用人脸识别功能',
    enroll_title: '录入人脸结果',
    enroll_btn: 'SDK相机录入人脸信息',
    verify_title: '人脸识别结果',
    verify_btn: '人脸识别+活体检测',
    liveness_title: '活体检测结果',
    liveness_btn: '检测人脸是否活体',
    query_title: '查询人脸特征',
    query_btn: '查询人脸特征信息',
    sync_title: '同步人脸特征',
    sync_btn: '同步人脸特征信息',
    image_enroll_title: '图片录入结果',
    image_enroll_btn: '图片录入人脸信息',
    delete_title: '删除人脸特征',
    delete_btn: '删除人脸特征信息',
    failed: '失败',
    unknown_error: '未知错误',
    undefined_status: '未定义状态',
    feature_len: 'faceFeature长度: ',
    base64_len: 'faceBase64长度: ',
  },
};

// 获取系统语言
const getSystemLanguage = () => {
  let locale: string | undefined;
  if (Platform.OS === 'ios') {
    locale =
      NativeModules.SettingsManager.settings.AppleLanguages[0] ||
      NativeModules.SettingsManager.settings.AppleLocale;
  } else {
    locale = NativeModules.I18nManager.localeIdentifier;
  }
  return locale?.startsWith('zh') ? 'zh' : 'en';
};

const lang = getSystemLanguage();
const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];
// ----------------

function App() {
  const demoFaceID = 'testUser001';
  const demoFeature = '0'.repeat(1024);

  const showResult = (title: string, result: FaceResult) => {
    const codeDesc = FACE_AI_STATUS_CODE_MAP[result.code] || t('undefined_status');

    Alert.alert(
      title,
      [
        `code: ${result.code}`,
        `codeDesc: ${codeDesc}`,
        `msg: ${result.msg}`,
        `faceID: ${result.faceID}`,
        `similarity: ${result.similarity}`,
        `liveness: ${result.liveness}`,
        `${t('feature_len')}${result.faceFeature?.length || 0}`,
        `${t('base64_len')}${result.faceBase64?.length || 0}`,
      ].join('\n'),
    );
  };

  const runAction = async (
    title: string,
    action: () => Promise<FaceResult>,
  ) => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(t('permission_error'), t('camera_denied'));
        return;
      }
    }

    try {
      const result = await action();
      showResult(title, result);
    } catch (error) {
      Alert.alert(
        `${title}${t('failed')}`,
        error instanceof Error ? error.message : t('unknown_error'),
      );
    }
  };

  const demoBase64 = 'demo_base64_image_string';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.title}>{t('title')}</Text>
        <Text style={styles.subtitle}>
          {Platform.OS === 'ios' ? 'iOS' : 'Android'} · {isFaceAIModuleAvailable() ? t('connected') : t('disconnected')}
        </Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              runAction(t('enroll_title'), () =>
                addFaceBySDKCamera(demoFaceID, {
                  mode: 1,
                  showConfirm: true,
                }),
              )
            }>
            <Text style={styles.buttonText}>{t('enroll_btn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              runAction(t('verify_title'), () =>
                faceVerify(demoFaceID, {
                  threshold: 0.83,
                  livenessType: 1,
                  motionTypes: '1,2,3,4,5',
                  timeout: 7,
                  steps: 2,
                  allowMultiFaces: true,
                }),
              )
            }>
            <Text style={styles.buttonText}>{t('verify_btn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              runAction(t('liveness_title'), () =>
                livenessVerify({
                  livenessType: 1,
                  motionTypes: '1,2,3,4,5',
                  timeout: 7,
                  steps: 2,
                  allowMultiFaces: true,
                  showResultTips: false,
                }),
              )
            }>
            <Text style={styles.buttonText}>{t('liveness_btn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => runAction(t('query_title'), () => getFaceFeature(demoFaceID))}>
            <Text style={styles.buttonText}>{t('query_btn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              runAction(t('sync_title'), () =>
                insertFaceFeature(demoFaceID, demoFeature),
              )
            }>
            <Text style={styles.buttonText}>{t('sync_btn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              runAction(t('image_enroll_title'), () => addFaceByImage(demoFaceID, demoBase64))
            }>
            <Text style={styles.buttonText}>{t('image_enroll_btn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => runAction(t('delete_title'), () => deleteFaceFeature(demoFaceID))}>
            <Text style={styles.buttonText}>{t('delete_btn')}</Text>
          </TouchableOpacity>

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
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
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
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
