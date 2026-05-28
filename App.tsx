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

function App() {
  // iOS: 跳转到原生 MYViewController
  const handleiOSPress = () => {
    try {
      if (FaceRNModule?.openMYViewController) {
        FaceRNModule.openMYViewController();
      } else {
        Alert.alert('提示', 'Native Module 尚未创建');
      }
    } catch (_e) {
      Alert.alert('提示', 'Native Module 尚未创建');
    }
  };

  // Android: SDK相机录入人脸信息
  const addFaceBySDKCamera = () => {
    FaceRNModule.addFaceBySDKCamera(
      'yourFaceID',
      1, // 1.快速模式 2.精确模式
      true, // 是否显示确认框
      (result: any) => {
        Alert.alert('录入人脸结果', JSON.stringify(result));
      },
    );
  };

  // Android: 人脸识别+活体检测
  const faceVerify = () => {
    FaceRNModule.faceVerify(
      'yourFaceID',
      0.84, // 阈值 [0.75, 0.95]
      1, // 1.动作活体 2.动作+炫彩 3.炫彩 4.静默
      '1,2,3,4,5', // 动作种类: 1.张嘴 2.微笑 3.眨眼 4.摇头 5.点头
      7, // 超时时间(秒)
      2, // 动作步骤数
      true, // 是否允许多人脸
      (result: any) => {
        Alert.alert(
          '人脸识别结果',
          `code: ${result.code}\nmsg: ${result.msg}\nsimilarity: ${result.similarity}\nliveness: ${result.liveness}`,
        );
      },
    );
  };

  // Android: 活体检测
  const livenessVerify = () => {
    FaceRNModule.livenessVerify(
      2, // 1.动作活体 2.动作+炫彩 3.炫彩 4.静默
      '1,2,3,4,5', // 动作种类
      7, // 超时时间
      2, // 动作步骤数
      true, // 是否允许多人脸
      (result: any) => {
        Alert.alert(
          '活体检测结果',
          `code: ${result.code}\nmsg: ${result.msg}\nliveness: ${result.liveness}`,
        );
      },
    );
  };

  // Android: 查询人脸特征
  const getFaceFeature = () => {
    FaceRNModule.getFaceFeature('yourFaceID', (result: any) => {
      Alert.alert('查询人脸特征', JSON.stringify(result));
    });
  };

  // Android: 同步人脸特征
  const insertFaceFeature = () => {
    FaceRNModule.insertFaceFeature(
      'yourFaceID',
      'faceFeature_1024_length_string',
      (result: any) => {
        Alert.alert('同步人脸特征', JSON.stringify(result));
      },
    );
  };

  // Android: 删除人脸特征
  const deleteFaceFeature = () => {
    FaceRNModule.deleteFaceFeature('yourFaceID', (result: any) => {
      Alert.alert('删除人脸特征', JSON.stringify(result));
    });
  };

  // Android: 切换摄像头
  const switchCamera = () => {
    FaceRNModule.switchCamera(1); // 0前置 1后置
    Alert.alert('提示', '已切换摄像头');
  };

  // Android: 跳转到原生FaceAI导航页面
  const openFaceAIActivity = () => {
    FaceRNModule.openFaceAIActivity();
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity style={styles.button} onPress={handleiOSPress}>
          <Text style={styles.buttonText}>跳转到 MYViewController</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Android UI
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>FaceAISDK Android Demo</Text>
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

        <TouchableOpacity style={styles.button} onPress={deleteFaceFeature}>
          <Text style={styles.buttonText}>删除人脸特征信息</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={switchCamera}>
          <Text style={styles.buttonTextSecondary}>切换摄像头(仅Android)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={openFaceAIActivity}>
          <Text style={styles.buttonTextSecondary}>
            跳转原生FaceAI导航页面
          </Text>
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
    backgroundColor: '#FF3B30',
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
  buttonSecondary: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  buttonTextSecondary: {
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
