@echo off
echo 🚀 Building Investi App APK...
echo.

echo 📦 Installing compatible dependencies...
npm install --legacy-peer-deps

echo 🧹 Clearing caches...
npx expo install --fix
npm cache clean --force
npx react-native start --reset-cache --port 8081 &

echo ⏳ Waiting for Metro to start...
timeout /t 10

echo 📱 Building APK...
npx eas build --platform android --local

echo.
echo ✅ Build process completed!
echo Check the build output above for any errors.
pause
