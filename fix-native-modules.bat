@echo off
echo ========================================
echo FIXING NATIVE MODULES ERROR
echo ========================================
echo.

echo [1/6] Stopping Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Clearing Metro cache...
rmdir /s /q %TEMP%\metro-* 2>nul
rmdir /s /q %TEMP%\haste-map-* 2>nul
rmdir /s /q .metro 2>nul

echo [3/6] Clearing React Native cache...
rmdir /s /q %TEMP%\react-native-* 2>nul
rmdir /s /q %TEMP%\react-* 2>nul

echo [4/6] Clearing Expo cache...
rmdir /s /q .expo 2>nul

echo [5/6] Clearing Android build cache...
cd android
call gradlew clean 2>nul
rmdir /s /q app\build 2>nul
rmdir /s /q build 2>nul
cd ..

echo [6/6] Clearing watchman cache...
watchman watch-del-all 2>nul

echo.
echo ========================================
echo CACHE CLEARED SUCCESSFULLY
echo ========================================
echo.
echo Next steps:
echo 1. Close the app completely on your device
echo 2. Run: npm start -- --clear
echo 3. Press 'a' to rebuild and run on Android
echo.
pause
