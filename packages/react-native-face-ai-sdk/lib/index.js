"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FACE_AI_STATUS_CODE_MAP = void 0;
exports.isFaceAIModuleAvailable = isFaceAIModuleAvailable;
exports.addFaceBySDKCamera = addFaceBySDKCamera;
exports.faceVerify = faceVerify;
exports.livenessVerify = livenessVerify;
exports.getFaceFeature = getFaceFeature;
exports.insertFaceFeature = insertFaceFeature;
exports.addFaceByImage = addFaceByImage;
exports.deleteFaceFeature = deleteFaceFeature;
const react_native_1 = require("react-native");
const MODULE_NAME = 'FaceRNModule';
const LINKING_ERROR = `The native module \`${MODULE_NAME}\` is not linked. Make sure that:\n\n` +
    react_native_1.Platform.select({
        ios: "- you ran 'pod install' in the iOS project\n",
        default: '',
    }) +
    '- you rebuilt the app after installing the package\n' +
    '- you are not running inside a plain Jest/Node environment without mocks';
const nativeModule = react_native_1.NativeModules[MODULE_NAME];
function getNativeModule() {
    if (!nativeModule) {
        throw new Error(LINKING_ERROR);
    }
    return nativeModule;
}
function normalizeResult(result) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        code: (_a = result === null || result === void 0 ? void 0 : result.code) !== null && _a !== void 0 ? _a : 0,
        msg: (_b = result === null || result === void 0 ? void 0 : result.msg) !== null && _b !== void 0 ? _b : '',
        faceID: (_c = result === null || result === void 0 ? void 0 : result.faceID) !== null && _c !== void 0 ? _c : '',
        similarity: (_d = result === null || result === void 0 ? void 0 : result.similarity) !== null && _d !== void 0 ? _d : 0,
        liveness: (_e = result === null || result === void 0 ? void 0 : result.liveness) !== null && _e !== void 0 ? _e : 0,
        faceFeature: (_f = result === null || result === void 0 ? void 0 : result.faceFeature) !== null && _f !== void 0 ? _f : '',
        faceBase64: (_g = result === null || result === void 0 ? void 0 : result.faceBase64) !== null && _g !== void 0 ? _g : '',
    };
}
function invokeWithPromise(call) {
    return new Promise(resolve => {
        call(result => resolve(normalizeResult(result)));
    });
}
exports.FACE_AI_STATUS_CODE_MAP = {
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
function isFaceAIModuleAvailable() {
    return Boolean(nativeModule);
}
function addFaceBySDKCamera(faceID, options = {}) {
    const { mode = 1, showConfirm = true } = options;
    return invokeWithPromise(callback => {
        getNativeModule().addFaceBySDKCamera(faceID, mode, showConfirm, callback);
    });
}
function faceVerify(faceID, options = {}) {
    const { threshold = 0.83, livenessType = 1, motionTypes = '1,2,3,4,5', timeout = 7, steps = 2, allowMultiFaces = true, } = options;
    return invokeWithPromise(callback => {
        getNativeModule().faceVerify(faceID, threshold, livenessType, motionTypes, timeout, steps, allowMultiFaces, callback);
    });
}
function livenessVerify(options = {}) {
    const { livenessType = 2, motionTypes = '1,2,3,4,5', timeout = 7, steps = 2, allowMultiFaces = true, showResultTips = false, } = options;
    return invokeWithPromise(callback => {
        getNativeModule().livenessVerify(livenessType, motionTypes, timeout, steps, allowMultiFaces, showResultTips, callback);
    });
}
function getFaceFeature(faceID) {
    return invokeWithPromise(callback => {
        getNativeModule().getFaceFeature(faceID, callback);
    });
}
function insertFaceFeature(faceID, faceFeature) {
    return invokeWithPromise(callback => {
        getNativeModule().insertFaceFeature(faceID, faceFeature, callback);
    });
}
function addFaceByImage(faceID, base64Image) {
    return invokeWithPromise(callback => {
        getNativeModule().addFaceBySDKImage(faceID, base64Image, callback);
    });
}
function deleteFaceFeature(faceID) {
    return invokeWithPromise(callback => {
        getNativeModule().deleteFaceFeature(faceID, callback);
    });
}
exports.default = {
    addFaceBySDKCamera,
    faceVerify,
    livenessVerify,
    getFaceFeature,
    insertFaceFeature,
    addFaceByImage,
    deleteFaceFeature,
    isFaceAIModuleAvailable,
};
