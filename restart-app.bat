@echo off
echo 🔄 Restarting Investi App with fixes...
echo.

echo 📦 Clearing npm cache...
npm cache clean --force

echo 🧹 Clearing Metro cache...
npx react-native start --reset-cache

echo 🚀 Starting development server...
npm start -- --clear

echo.
echo ✅ App restarted with all fixes applied!
pause
