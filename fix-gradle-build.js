#!/usr/bin/env node

/**
 * INVESTI APP - GRADLE BUILD FIX
 * Fixes version incompatibilities for APK build
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Gradle build issues...\n');

// 1. Update package.json with compatible versions
function fixPackageVersions() {
    console.log('1️⃣ Updating package.json with compatible versions...');
    
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update to compatible versions
    packageJson.dependencies = {
        ...packageJson.dependencies,
        "expo": "~51.0.0", // Downgrade to stable version
        "react-native": "0.74.5", // Compatible with Expo 51
        "@expo/webpack-config": "^19.0.1"
    };
    
    // Update dev dependencies
    packageJson.devDependencies = {
        ...packageJson.devDependencies,
        "babel-preset-expo": "~11.0.0"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log('   ✅ Updated package.json');
}

// 2. Update app.json for compatibility
function fixAppConfig() {
    console.log('\n2️⃣ Updating app.json configuration...');
    
    const appPath = path.join(__dirname, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));
    
    // Update SDK version
    appJson.expo.sdkVersion = "51.0.0";
    
    // Add build properties for Android
    if (!appJson.expo.plugins) {
        appJson.expo.plugins = [];
    }
    
    // Update expo-build-properties plugin
    const buildPropsIndex = appJson.expo.plugins.findIndex(plugin => 
        Array.isArray(plugin) && plugin[0] === "expo-build-properties"
    );
    
    if (buildPropsIndex !== -1) {
        appJson.expo.plugins[buildPropsIndex] = [
            "expo-build-properties",
            {
                "android": {
                    "compileSdkVersion": 34,
                    "targetSdkVersion": 34,
                    "buildToolsVersion": "34.0.0"
                },
                "ios": {
                    "useFrameworks": "static"
                }
            }
        ];
    }
    
    fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2), 'utf8');
    console.log('   ✅ Updated app.json');
}

// 3. Create gradle.properties fix
function createGradleProperties() {
    console.log('\n3️⃣ Creating gradle.properties...');
    
    const gradleProps = `# Gradle properties for Investi App
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
android.compileSdkVersion=34
android.targetSdkVersion=34
android.buildToolsVersion=34.0.0

# Enable new architecture
newArchEnabled=false

# Hermes
hermesEnabled=true

# Flipper
FLIPPER_VERSION=0.182.0

# Proguard
android.enableProguardInReleaseBuilds=false
`;
    
    const androidDir = path.join(__dirname, 'android');
    if (!fs.existsSync(androidDir)) {
        fs.mkdirSync(androidDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(androidDir, 'gradle.properties'), gradleProps, 'utf8');
    console.log('   ✅ Created gradle.properties');
}

// 4. Create build script
function createBuildScript() {
    console.log('\n4️⃣ Creating build script...');
    
    const buildScript = `@echo off
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
`;
    
    fs.writeFileSync(path.join(__dirname, 'build-apk.bat'), buildScript, 'utf8');
    console.log('   ✅ Created build-apk.bat');
}

// 5. Create EAS configuration
function createEASConfig() {
    console.log('\n5️⃣ Creating EAS build configuration...');
    
    const easConfig = {
        "cli": {
            "version": ">= 5.2.0"
        },
        "build": {
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
                    "buildType": "apk"
                }
            },
            "production": {
                "android": {
                    "buildType": "apk"
                }
            }
        },
        "submit": {
            "production": {}
        }
    };
    
    fs.writeFileSync(path.join(__dirname, 'eas.json'), JSON.stringify(easConfig, null, 2), 'utf8');
    console.log('   ✅ Created eas.json');
}

// Execute all fixes
async function runAllFixes() {
    try {
        fixPackageVersions();
        fixAppConfig();
        createGradleProperties();
        createBuildScript();
        createEASConfig();
        
        console.log('\n🎉 All fixes applied successfully!\n');
        console.log('📋 Next steps to build APK:');
        console.log('1. Run: npm install --legacy-peer-deps');
        console.log('2. Run: npx expo install --fix');
        console.log('3. Run: build-apk.bat (or follow manual steps below)');
        console.log('\n🔧 Manual build steps:');
        console.log('1. npx eas build --platform android --local');
        console.log('2. Or: npx expo run:android --variant release');
        
    } catch (error) {
        console.error('❌ Error during fixes:', error);
        process.exit(1);
    }
}

runAllFixes();
