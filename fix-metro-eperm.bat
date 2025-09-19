@echo off
echo Fixing Metro EPERM errors...

echo Stopping any running Metro processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo Clearing Metro cache...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q .expo 2>nul
rmdir /s /q %TEMP%\metro-* 2>nul
rmdir /s /q %TEMP%\haste-map-* 2>nul

echo Clearing npm cache...
npm cache clean --force

echo Clearing Expo cache...
npx expo install --fix

echo Setting NODE_OPTIONS for memory...
set NODE_OPTIONS=--max-old-space-size=4096

echo Starting Expo with single worker...
npx expo start --clear --dev-client

pause
