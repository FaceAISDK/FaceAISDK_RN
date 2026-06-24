import {NativeModules, Platform} from 'react-native';

import type {
  AddFaceBySDKCameraOptions,
  FaceNativeModule,
  FaceResult,
  FaceVerifyOptions,
  LivenessVerifyOptions,
} from './types';

const MODULE_NAME = 'FaceRNModule';

const LINKING_ERROR =
  `The native module \`${MODULE_NAME}\` is not linked. Make sure that:\n\n` +
  Platform.select({
    ios: "- you ran 'pod install' in the iOS project\n",
    default: '',
  }) +
  '- you rebuilt the app after installing the package\n' +
  '- you are not running inside a plain Jest/Node environment without mocks';

const nativeModule = NativeModules[MODULE_NAME] as FaceNativeModule | undefined;

function getNativeModule(): FaceNativeModule {
  if (!nativeModule) {
    throw new Error(LINKING_ERROR);
  }

  return nativeModule;
}

function normalizeResult(result: Partial<FaceResult> | undefined): FaceResult {
  return {
    code: result?.code ?? 0,
    msg: result?.msg ?? '',
    faceID: result?.faceID ?? '',
    similarity: result?.similarity ?? 0,
    liveness: result?.liveness ?? 0,
    faceFeature: result?.faceFeature ?? '',
    faceBase64: result?.faceBase64 ?? '',
  };
}

function invokeWithPromise(
  call: (callback: (result: FaceResult) => void) => void,
): Promise<FaceResult> {
  return new Promise(resolve => {
    call(result => resolve(normalizeResult(result)));
  });
}

export const FACE_AI_STATUS_CODE_MAP: Record<number, string> = {
  [-1]: '相机权限被拒绝',
  0: '初始化状态/用户取消',
  1: '人脸识别或录入成功',
  2: '人脸识别失败，相似度低于阈值',
  3: '动作活体检测成功',
  4: '动作活体检测超时',
  5: '多次未检测到人脸',
  6: '本地不存在对应的人脸特征',
  7: '炫彩活体检测成功',
  8: '炫彩活体检测失败',
  9: '炫彩活体检测失败，环境过亮',
  10: '活体检测流程完成',
  11: '静默活体检测失败',
  12: '未录入对应人脸',
  13: '检测到多人脸',
};

export function isFaceAIModuleAvailable(): boolean {
  return Boolean(nativeModule);
}

export function addFaceBySDKCamera(
  faceID: string,
  options: AddFaceBySDKCameraOptions = {},
): Promise<FaceResult> {
  const {mode = 1, showConfirm = true} = options;

  return invokeWithPromise(callback => {
    getNativeModule().addFaceBySDKCamera(faceID, mode, showConfirm, callback);
  });
}

export function faceVerify(
  faceID: string,
  options: FaceVerifyOptions = {},
): Promise<FaceResult> {
  const {
    threshold = 0.83,
    livenessType = 1,
    motionTypes = '1,2,3,4,5',
    timeout = 7,
    steps = 2,
    allowMultiFaces = true,
  } = options;

  return invokeWithPromise(callback => {
    getNativeModule().faceVerify(
      faceID,
      threshold,
      livenessType,
      motionTypes,
      timeout,
      steps,
      allowMultiFaces,
      callback,
    );
  });
}

export function livenessVerify(
  options: LivenessVerifyOptions = {},
): Promise<FaceResult> {
  const {
    livenessType = 2,
    motionTypes = '1,2,3,4,5',
    timeout = 7,
    steps = 2,
    allowMultiFaces = true,
    showResultTips = false,
  } = options;

  return invokeWithPromise(callback => {
    getNativeModule().livenessVerify(
      livenessType,
      motionTypes,
      timeout,
      steps,
      allowMultiFaces,
      showResultTips,
      callback,
    );
  });
}

export function getFaceFeature(faceID: string): Promise<FaceResult> {
  return invokeWithPromise(callback => {
    getNativeModule().getFaceFeature(faceID, callback);
  });
}

export function insertFaceFeature(
  faceID: string,
  faceFeature: string,
): Promise<FaceResult> {
  return invokeWithPromise(callback => {
    getNativeModule().insertFaceFeature(faceID, faceFeature, callback);
  });
}

export function addFaceByImage(
  faceID: string,
  base64Image: string,
): Promise<FaceResult> {
  return invokeWithPromise(callback => {
    getNativeModule().addFaceBySDKImage(faceID, base64Image, callback);
  });
}

export function deleteFaceFeature(faceID: string): Promise<FaceResult> {
  return invokeWithPromise(callback => {
    getNativeModule().deleteFaceFeature(faceID, callback);
  });
}

export type {
  AddFaceBySDKCameraOptions,
  FaceResult,
  FaceVerifyOptions,
  LivenessVerifyOptions,
} from './types';

export default {
  addFaceBySDKCamera,
  faceVerify,
  livenessVerify,
  getFaceFeature,
  insertFaceFeature,
  addFaceByImage,
  deleteFaceFeature,
  isFaceAIModuleAvailable,
};

