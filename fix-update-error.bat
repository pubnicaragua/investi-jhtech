@echo off
echo Cleaning Expo cache and Metro bundler...

if exist .expo (
    rmdir /s /q .expo
    echo Removed .expo folder
)

if exist .metro (
    rmdir /s /q .metro
    echo Removed .metro folder
)

if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo Removed node_modules\.cache folder
)

if exist android\app\build (
    rmdir /s /q android\app\build
    echo Removed android build folder
)

echo.
echo Cache cleared successfully!
echo.
echo Now run: npm start
pause
