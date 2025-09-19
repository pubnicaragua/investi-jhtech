@echo off
echo 🔧 Fixing yarn lockfile conflict for EAS build...
echo.

echo 🧹 Cleaning up conflicting files...
if exist package-lock.json del /f package-lock.json
if exist node_modules rmdir /s /q node_modules 2>nul

echo 📦 Installing dependencies with yarn...
yarn install

echo 🔧 Fixing any peer dependency issues...
yarn install --check-files

echo ✅ Dependencies installed successfully!
echo.
echo 🚀 Ready to build APK with:
echo npx eas build --platform android --local
echo.
pause
