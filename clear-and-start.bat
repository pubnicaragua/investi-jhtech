@echo off
echo 🧹 Limpiando cache de Expo y Metro...

REM Limpiar cache de Expo
echo Limpiando cache de Expo...
npx expo r -c

REM Limpiar cache de Metro
echo Limpiando cache de Metro...
npx react-native start --reset-cache

REM Limpiar node_modules si es necesario
REM echo Limpiando node_modules...
REM rmdir /s /q node_modules
REM npm install

echo ✅ Cache limpiado. Iniciando servidor...
npx expo start --clear --dev-client

pause
