#!/usr/bin/env node

/**
 * INVESTI APP - GRADLE VERSION FIX
 * Fixes Gradle version requirement for EAS build
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Gradle version for EAS build...\n');

function updateEASConfig() {
    console.log('1️⃣ Updating EAS configuration...');
    
    const easPath = path.join(__dirname, 'eas.json');
    let easConfig;
    
    if (fs.existsSync(easPath)) {
        easConfig = JSON.parse(fs.readFileSync(easPath, 'utf8'));
    } else {
        easConfig = {
            "cli": {
                "version": ">= 5.2.0"
            },
            "build": {},
            "submit": {
                "production": {}
            }
        };
    }
    
    // Update build configuration with Gradle fix
    easConfig.build = {
        ...easConfig.build,
        "development": {
            "developmentClient": true,
            "distribution": "internal",
            "android": {
                "gradleCommand": ":app:assembleDebug",
                "buildType": "apk"
            }
        },
        "preview": {
            "distribution": "internal",
            "android": {
                "buildType": "apk",
                "gradleCommand": ":app:assembleRelease"
            },
            "env": {
                "GRADLE_VERSION": "8.10.2"
            }
        },
        "production": {
            "android": {
                "buildType": "apk"
            },
            "env": {
                "GRADLE_VERSION": "8.10.2"
            }
        }
    };
    
    fs.writeFileSync(easPath, JSON.stringify(easConfig, null, 2), 'utf8');
    console.log('   ✅ Updated eas.json with Gradle 8.10.2');
}

function updateAppConfig() {
    console.log('\n2️⃣ Updating app.json for Gradle compatibility...');
    
    const appPath = path.join(__dirname, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));
    
    // Update expo-build-properties plugin
    const plugins = appJson.expo.plugins || [];
    const buildPropsIndex = plugins.findIndex(plugin => 
        Array.isArray(plugin) && plugin[0] === "expo-build-properties"
    );
    
    const buildPropsConfig = {
        "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0",
            "gradleVersion": "8.10.2",
            "androidGradlePluginVersion": "8.2.1"
        },
        "ios": {
            "useFrameworks": "static"
        }
    };
    
    if (buildPropsIndex !== -1) {
        plugins[buildPropsIndex] = ["expo-build-properties", buildPropsConfig];
    } else {
        plugins.push(["expo-build-properties", buildPropsConfig]);
    }
    
    appJson.expo.plugins = plugins;
    
    fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2), 'utf8');
    console.log('   ✅ Updated app.json with Gradle 8.10.2');
}

function createBuildScript() {
    console.log('\n3️⃣ Creating fixed build script...');
    
    const buildScript = `@echo off
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
`;
    
    fs.writeFileSync(path.join(__dirname, 'build-fixed.bat'), buildScript, 'utf8');
    console.log('   ✅ Created build-fixed.bat');
}

function runFixes() {
    try {
        updateEASConfig();
        updateAppConfig();
        createBuildScript();
        
        console.log('\n🎉 Gradle version fixes applied!\n');
        console.log('📋 Next steps:');
        console.log('1. Run: build-fixed.bat');
        console.log('2. Or manually: npx eas build --platform android --profile preview --clear-cache');
        
    } catch (error) {
        console.error('❌ Error during fixes:', error);
        process.exit(1);
    }
}

runFixes();
