@echo off
echo 🚀 Building Investi App with Gradle 8.10.2 fix...
echo.

echo 🧹 Cleaning previous builds...
if exist android rmdir /s /q android 2>nul

echo 🔧 Generating native code with latest Gradle...
npx expo prebuild --clean --platform android

echo 📱 Building APK with EAS (fixed Gradle version)...
npx eas build --platform android --profile preview --clear-cache

echo.
echo ✅ Build initiated with Gradle 8.10.2!
echo 📱 Check https://expo.dev for build status
pause
