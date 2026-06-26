require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'react-native-face-sdk'
  s.version      = package['version']
  s.summary      = package['description']
  s.license      = package['license']
  s.homepage     = 'https://github.com/FaceAISDK/FaceAISDK_RN'
  s.authors      = { 'FaceAISDK' => 'support@faceaisdk.example' }
  s.platforms    = { :ios => '15.5' }
  s.source       = { :git => 'https://github.com/FaceAISDK/FaceAISDK_RN.git', :tag => s.version.to_s }
  s.source_files = 'ios/**/*.{h,m,swift}'
  s.resources    = [
    'ios/Resources/**/*',
  ]
  s.requires_arc = true
  s.swift_version = '5.9'
  s.module_name  = 'FaceAISDKReactNative'

  s.dependency 'React-Core'
  s.dependency 'FaceAISDK_Core', '2026.06.25'

  #应该不需要重复依赖了
  s.dependency 'TensorFlowLiteSwift', '~> 2.17.0'
end

