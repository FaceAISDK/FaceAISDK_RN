import {
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  NativeModules,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';

const {FaceRNModule} = NativeModules;

/**
 * 统一回调结果类型
 * iOS/Android 均返回相同结构:
 * { code, msg, faceID, similarity, liveness, faceFeature, faceBase64 }
 */
type FaceResult = {
  code: number;
  msg: string;
  faceID: string;
  similarity: number;
  liveness: number;
  faceFeature: string;
  faceBase64: string;
};

function App() {
  // 1. SDK相机录入人脸信息
  const addFaceBySDKCamera = () => {
    FaceRNModule.addFaceBySDKCamera(
      'yourFaceID',
      1, // 1.快速模式 2.精确模式
      true, // 是否显示确认框
      (result: FaceResult) => {
        Alert.alert('录入人脸结果', `code: ${result.code}\nmsg: ${result.msg}`);
      },
    );
  };

  // 2. 人脸识别+活体检测
  const faceVerify = () => {
    FaceRNModule.faceVerify(
      'yourFaceID',
      0.84, // 阈值 [0.75, 0.95]
      1, // 1.动作活体 2.动作+炫彩 3.炫彩 4.静默
      '1,2,3,4,5', // 动作种类: 1.张嘴 2.微笑 3.眨眼 4.摇头 5.点头
      7, // 超时时间(秒)
      2, // 动作步骤数
      true, // 是否允许多人脸
      (result: FaceResult) => {
        Alert.alert(
          '人脸识别结果',
          `code: ${result.code}\nmsg: ${result.msg}\nsimilarity: ${result.similarity}\nliveness: ${result.liveness}`,
        );
      },
    );
  };

  // 3. 活体检测
  const livenessVerify = () => {
    FaceRNModule.livenessVerify(
      2, // 1.动作活体 2.动作+炫彩 3.炫彩 4.静默
      '1,2,3,4,5', // 动作种类
      7, // 超时时间
      2, // 动作步骤数
      true, // 是否允许多人脸
      false, // showResultTips: 是否在SDK页面内显示结果提示(Toast/弹窗)。默认为true
      (result: FaceResult) => {
        Alert.alert(
          '活体检测结果',
          `code: ${result.code}\nmsg: ${result.msg}\nliveness: ${result.liveness}`,
        );
      },
    );
  };

  // 4. 查询人脸特征
  const getFaceFeature = () => {
    FaceRNModule.getFaceFeature('yourFaceID', (result: FaceResult) => {
      Alert.alert(
        '查询人脸特征',
        `code: ${result.code}\nmsg: ${result.msg}\nfaceFeature长度: ${result.faceFeature?.length || 0}`,
      );
    });
  };

  // 5. 同步人脸特征
  const insertFaceFeature = () => {
    FaceRNModule.insertFaceFeature(
      'yourFaceID',
      'faceFeature_1024_length_string',
      (result: FaceResult) => {
        Alert.alert('同步人脸特征', `code: ${result.code}\nmsg: ${result.msg}`);
      },
    );
  };

  // 6. 图片录入人脸信息
  const addFaceByImage = () => {
    // 实际使用时传入真实的base64图片
    const demoBase64 = 'demo_base64_image_string';
    FaceRNModule.addFaceBySDKImage(
      'yourFaceID',
      demoBase64,
      (result: FaceResult) => {
        Alert.alert(
          '图片录入结果',
          `code: ${result.code}\nmsg: ${result.msg}\nfaceFeature长度: ${result.faceFeature?.length || 0}`,
        );
      },
    );
  };

  // 7. 删除人脸特征
  const deleteFaceFeature = () => {
    FaceRNModule.deleteFaceFeature('yourFaceID', (result: FaceResult) => {
      Alert.alert('删除人脸特征', `code: ${result.code}\nmsg: ${result.msg}`);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>人脸识别FaceSDK Demo</Text>
      <Text style={styles.subtitle}>
        {Platform.OS === 'ios' ? 'iOS' : 'Android'}
      </Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.button} onPress={addFaceBySDKCamera}>
          <Text style={styles.buttonText}>SDK相机录入人脸信息</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={faceVerify}>
          <Text style={styles.buttonText}>人脸识别+活体检测</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={livenessVerify}>
          <Text style={styles.buttonText}>检测人脸是否活体</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={getFaceFeature}>
          <Text style={styles.buttonText}>查询人脸特征信息</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={insertFaceFeature}>
          <Text style={styles.buttonText}>同步人脸特征信息</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={addFaceByImage}>
          <Text style={styles.buttonText}>图片录入人脸信息</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={deleteFaceFeature}>
          <Text style={styles.buttonText}>删除人脸特征信息</Text>
        </TouchableOpacity>

      </ScrollView>
      <Text style={styles.footer}>Powered by FaceAISDK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 30,
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
  buttonSecondary: {
    backgroundColor: '#007AFF',
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
