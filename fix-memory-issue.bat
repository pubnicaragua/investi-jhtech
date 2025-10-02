@echo off
echo ========================================
echo FIXING METRO MEMORY ISSUE
echo ========================================
echo.

echo [1/6] Stopping Metro bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning Metro cache...
if exist .metro rmdir /s /q .metro
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo [3/6] Cleaning Expo cache...
if exist .expo rmdir /s /q .expo

echo [4/6] Cleaning Android build cache...
cd android
if exist .gradle rmdir /s /q .gradle
if exist app\build rmdir /s /q app\build
cd ..

echo [5/6] Cleaning temp files...
if exist %TEMP%\metro-* rmdir /s /q %TEMP%\metro-* 2>nul
if exist %TEMP%\react-* rmdir /s /q %TEMP%\react-* 2>nul

echo.
echo ========================================
echo CACHE CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo [6/6] Starting Metro with increased memory...
echo.

set NODE_OPTIONS=--max-old-space-size=8192
npm run start:memory
