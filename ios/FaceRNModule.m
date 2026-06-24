//
//  FaceRNModule.m
//  FaceRN
//
//  This file is a duplicate. See FaceRN/FaceRNModule.m for the actual implementation.
//  统一 iOS/Android 桥接 API，参考 FaceAISDK_uniapp_UTS

#import "FaceRNModule.h"
#import <UIKit/UIKit.h>

#import "FaceAISDKReactNative-Swift.h"

@implementation FaceRNModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

//结果Code 对应含义message 返回给插件调用方
- (NSString *)getMsgByCode:(NSInteger)code {
    switch (code) {
        case 0: return @"User canceled/interrupted";
        case 1: return @"Operation succeeded";
        case 2: return @"Low face similarity (verification failed)";
        case 3: return @"Motion liveness passed";
        case 4: return @"Motion liveness timeout";
        case 5: return @"No face detected repeatedly";
        case 6: return @"No local face feature found";
        case 7: return @"Color liveness passed";
        case 8: return @"Color liveness failed";
        case 9: return @"Ambient light too strong (color failed)";
        case 10: return @"All liveness checks passed";
        case 11: return @"Silent liveness failed";
        case 12: return @"No enrolled face information";
        case 13: return @"Multiple faces detected";
        default: return @"Unknown status code";
    }
}

RCT_EXPORT_METHOD(addFaceBySDKCamera:(NSString *)faceID
                  addFacePerformanceMode:(nonnull NSNumber *)performanceMode
                  needShowConfirmDialog:(BOOL)needConfirm
                  callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [FaceSDKSwiftManager showAddFaceByCamera:faceID :performanceMode :needConfirm :^(NSNumber * _Nonnull resultCode, NSString * _Nonnull feature) {
            NSString *msg = [resultCode integerValue] == 1
                ? @"Face enrollment succeeded"
                : @"User canceled enrollment";
            NSString *base64Str = @"";
            if ([resultCode integerValue] == 1) {
                base64Str = [FaceSDKSwiftManager getFaceImageBase64:faceID] ?: @"";
            }
            NSString *faceFeature = feature.length > 0 ? feature : ([FaceSDKSwiftManager getiOSFaceFeature:faceID] ?: @"");
            NSDictionary *result = @{
                @"code": resultCode,
                @"msg": msg,
                @"faceID": faceID ?: @"",
                @"similarity": @(0),
                @"liveness": @(0),
                @"faceFeature": faceFeature,
                @"faceBase64": base64Str
            };
            callback(@[result]);
        }];
    });
}

RCT_EXPORT_METHOD(faceVerify:(NSString *)faceID
                  threshold:(nonnull NSNumber *)threshold
                  faceLivenessType:(nonnull NSNumber *)faceLivenessType
                  motionLivenessTypes:(NSString *)motionLivenessTypes
                  motionLivenessTimeOut:(nonnull NSNumber *)motionLivenessTimeOut
                  motionLivenessSteps:(nonnull NSNumber *)motionLivenessSteps
                  allowMultiFaces:(BOOL)allowMultiFaces
                  callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [FaceSDKSwiftManager showFaceVerify:faceID :threshold :faceLivenessType :motionLivenessTypes :motionLivenessTimeOut :motionLivenessSteps :^(NSNumber * _Nonnull resultCode, NSNumber * _Nonnull similarity, NSNumber * _Nonnull liveness) {
            NSString *base64Str = @"";
            NSInteger code = [resultCode integerValue];
            if (code == 1 || code == 10) {
                base64Str = [FaceSDKSwiftManager getFaceImageBase64:faceID] ?: @"";
            }
            NSDictionary *result = @{
                @"code": resultCode,
                @"msg": [self getMsgByCode:code],
                @"faceID": faceID ?: @"",
                @"similarity": similarity,
                @"liveness": liveness,
                @"faceFeature": @"",
                @"faceBase64": base64Str
            };
            callback(@[result]);
        }];
    });
}

RCT_EXPORT_METHOD(livenessVerify:(nonnull NSNumber *)faceLivenessType
                  motionLivenessTypes:(NSString *)motionLivenessTypes
                  motionLivenessTimeOut:(nonnull NSNumber *)motionLivenessTimeOut
                  motionLivenessSteps:(nonnull NSNumber *)motionLivenessSteps
                  allowMultiFaces:(BOOL)allowMultiFaces
                  showResultTips:(BOOL)showResultTips
                  callback:(RCTResponseSenderBlock)callback) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [FaceSDKSwiftManager showLivenessVerify:faceLivenessType :motionLivenessTypes :motionLivenessTimeOut :motionLivenessSteps :showResultTips :^(NSNumber * _Nonnull resultCode, NSNumber * _Nonnull liveness) {
            NSString *base64Str = @"";
            NSInteger code = [resultCode integerValue];
            if (code == 1 || code == 10) {
                base64Str = [FaceSDKSwiftManager getFaceImageBase64:@"Liveness"] ?: @"";
            }
            NSDictionary *result = @{
                @"code": resultCode,
                @"msg": [self getMsgByCode:code],
                @"faceID": @"",
                @"similarity": @(0),
                @"liveness": liveness,
                @"faceFeature": @"",
                @"faceBase64": base64Str
            };
            callback(@[result]);
        }];
    });
}

RCT_EXPORT_METHOD(getFaceFeature:(NSString *)faceID
                  callback:(RCTResponseSenderBlock)callback) {
    NSString *faceFeature = [FaceSDKSwiftManager getiOSFaceFeature:faceID] ?: @"";
    [FaceSDKSwiftManager isFaceFeatureExist:faceID :^(NSNumber * _Nonnull resultCode, NSString * _Nonnull msg) {
        NSDictionary *result = @{
            @"code": resultCode,
            @"msg": msg,
            @"faceID": faceID ?: @"",
            @"similarity": @(0),
            @"liveness": @(0),
            @"faceFeature": faceFeature,
            @"faceBase64": @""
        };
        callback(@[result]);
    }];
}

RCT_EXPORT_METHOD(insertFaceFeature:(NSString *)faceID
                  faceFeature:(NSString *)faceFeature
                  callback:(RCTResponseSenderBlock)callback) {
    [FaceSDKSwiftManager insertFaceFeature:faceID :faceFeature :^(NSNumber * _Nonnull resultCode, NSString * _Nonnull msg) {
        NSDictionary *result = @{
            @"code": resultCode,
            @"msg": msg,
            @"faceID": faceID ?: @"",
            @"similarity": @(0),
            @"liveness": @(0),
            @"faceFeature": @"",
            @"faceBase64": @""
        };
        callback(@[result]);
    }];
}

RCT_EXPORT_METHOD(addFaceBySDKImage:(NSString *)faceID
                  base64FaceImage:(NSString *)base64FaceImage
                  callback:(RCTResponseSenderBlock)callback) {
    [FaceSDKSwiftManager addFaceByBase64:faceID :base64FaceImage :^(NSNumber * _Nonnull resultCode, NSString * _Nonnull feature, NSString * _Nonnull msg) {
        NSDictionary *result = @{
            @"code": resultCode,
            @"msg": msg,
            @"faceID": faceID ?: @"",
            @"similarity": @(0),
            @"liveness": @(0),
            @"faceFeature": feature ?: @"",
            @"faceBase64": @""
        };
        callback(@[result]);
    }];
}

RCT_EXPORT_METHOD(deleteFaceFeature:(NSString *)faceID
                  callback:(RCTResponseSenderBlock)callback) {
    [FaceSDKSwiftManager deleteFaceFeature:faceID];
    NSDictionary *result = @{
        @"code": @(1),
        @"msg": @"Delete Success",
        @"faceID": faceID ?: @"",
        @"similarity": @(0),
        @"liveness": @(0),
        @"faceFeature": @"",
        @"faceBase64": @""
    };
    callback(@[result]);
}

@end
