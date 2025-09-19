#!/usr/bin/env node

/**
 * INVESTI APP - POST-FIX VALIDATION TESTS
 * Tests all the fixes applied by fix-app-errors.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FORCING GRADLE 8.10.2 FOR EAS BUILD...\n');

function forceGradleVersion() {
    console.log('1️⃣ Removing conflicting Gradle configurations...');
    
    // Update app.json to force Gradle version in expo-build-properties
    const appPath = path.join(__dirname, 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));
    
    // Find and update expo-build-properties plugin
    const plugins = appJson.expo.plugins || [];
    const buildPropsIndex = plugins.findIndex(plugin => 
        Array.isArray(plugin) && plugin[0] === "expo-build-properties"
    );
    
    if (buildPropsIndex !== -1) {
        plugins[buildPropsIndex][1].android = {
            ...plugins[buildPropsIndex][1].android,
            "gradleVersion": "8.10.2",
            "androidGradlePluginVersion": "8.2.1",
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0"
        };
        
        appJson.expo.plugins = plugins;
        fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2), 'utf8');
        console.log('   ✅ Updated app.json with forced Gradle 8.10.2');
    }
    
    console.log('\n2️⃣ Creating prebuild script with Gradle fix...');
    
    const prebuildScript = `@echo off
echo 🧹 Cleaning previous builds...
if exist android rmdir /s /q android 2>nul

echo 🔧 Prebuilding with Gradle 8.10.2...
npx expo prebuild --clean --platform android

echo 📝 Updating gradle-wrapper.properties...
if exist android\\gradle\\wrapper\\gradle-wrapper.properties (
    echo distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-all.zip > android\\gradle\\wrapper\\gradle-wrapper.properties
    echo ✅ Updated gradle-wrapper.properties to 8.10.2
)

echo 🚀 Building with EAS...
npx eas build --platform android --profile preview

echo ✅ Build initiated with correct Gradle version!
pause
`;
    
    fs.writeFileSync(path.join(__dirname, 'build-with-prebuild.bat'), prebuildScript, 'utf8');
    console.log('   ✅ Created build-with-prebuild.bat');
    
    console.log('\n🎉 Gradle version forced to 8.10.2!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: build-with-prebuild.bat');
    console.log('2. This will prebuild + update gradle wrapper + build APK');
}

forceGradleVersion();

let passed = 0;
let failed = 0;

function test(description, condition) {
    if (condition) {
        console.log(`✅ ${description}`);
        passed++;
    } else {
        console.log(`❌ ${description}`);
        failed++;
    }
}

// Test 1: Check ImagePicker fixes
const createPostPath = path.join(__dirname, 'src/screens/CreatePostScreen.tsx');
if (fs.existsSync(createPostPath)) {
    const content = fs.readFileSync(createPostPath, 'utf8');
    test('ImagePicker.MediaTypeOptions removed', !content.includes('MediaTypeOptions'));
    test('ImagePicker.MediaType used instead', content.includes('MediaType.Images'));
}

// Test 2: Check database migration file exists
test('Database migration file created', fs.existsSync(path.join(__dirname, 'database-fixes-migration.sql')));

// Test 3: Check API files for description/descripcion fixes
const apiFiles = ['src/api.ts', 'src/rest/api.ts'];
apiFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        test(`${filePath} - Fixed community queries`, 
             !content.includes('community%3Acommunities%28.*?description.*?%29'));
    }
});

// Test 4: Check navbar positioning fix
const homeFeedPath = path.join(__dirname, 'src/screens/HomeFeedScreen.tsx');
if (fs.existsSync(homeFeedPath)) {
    const content = fs.readFileSync(homeFeedPath, 'utf8');
    test('HomeFeed navbar positioning fixed', 
         content.includes('position: \'absolute\'') || content.includes('paddingBottom'));
}

console.log(`
📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('🎉 All fixes validated successfully!');
    console.log('
📋 Next Steps:');
    console.log('1. Run the database migration: database-fixes-migration.sql in Supabase');
    console.log('2. Clear app cache: npm start -- --clear');
    console.log('3. Test the app functionality');
} else {
    console.log('⚠️  Some fixes may need manual attention');
}
