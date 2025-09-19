#!/usr/bin/env node

/**
 * INVESTI APP - LOCKFILE CONFLICT FIX
 * Fixes yarn/npm lockfile conflicts for EAS build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing lockfile conflicts for EAS build...\n');

function fixLockfileConflict() {
    console.log('1️⃣ Removing conflicting lock files...');
    
    // Remove package-lock.json if exists
    const packageLockPath = path.join(__dirname, 'package-lock.json');
    if (fs.existsSync(packageLockPath)) {
        fs.unlinkSync(packageLockPath);
        console.log('   ✅ Removed package-lock.json');
    }
    
    // Remove node_modules to ensure clean install
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
        console.log('   🗑️ Removing node_modules...');
        try {
            execSync('rmdir /s /q node_modules', { stdio: 'inherit', cwd: __dirname });
        } catch (error) {
            // Try alternative method
            try {
                execSync('rm -rf node_modules', { stdio: 'inherit', cwd: __dirname });
            } catch (e) {
                console.log('   ⚠️ Please manually delete node_modules folder');
            }
        }
    }
}

function createYarnInstallScript() {
    console.log('\n2️⃣ Creating yarn install script...');
    
    const yarnInstallScript = `@echo off
echo 🧹 Cleaning up...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 📦 Installing with yarn...
yarn install

echo ✅ Dependencies installed with yarn
pause
`;
    
    fs.writeFileSync(path.join(__dirname, 'yarn-install.bat'), yarnInstallScript, 'utf8');
    console.log('   ✅ Created yarn-install.bat');
}

function updatePackageJsonForYarn() {
    console.log('\n3️⃣ Updating package.json scripts for yarn...');
    
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update scripts to use yarn
    packageJson.scripts = {
        ...packageJson.scripts,
        "start": "yarn expo start --clear",
        "dev": "yarn expo start --clear --dev-client", 
        "prod": "yarn expo start --clear --no-dev --minify",
        "android": "yarn expo start --clear --no-dev --minify --android",
        "ios": "yarn expo start --clear --no-dev --minify --ios",
        "reset": "yarn install",
        "build:android": "eas build --platform android",
        "build:android-local": "eas build --platform android --local"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log('   ✅ Updated package.json scripts');
}

function createEASBuildScript() {
    console.log('\n4️⃣ Creating EAS build script...');
    
    const easBuildScript = `@echo off
echo 🚀 Building Investi App with EAS...
echo.

echo 📦 Installing dependencies with yarn...
call yarn-install.bat

echo 🔧 Prebuild for native code...
npx expo prebuild --clean

echo 📱 Building APK with EAS...
npx eas build --platform android --local

echo.
echo ✅ Build completed! Check output above for APK location.
pause
`;
    
    fs.writeFileSync(path.join(__dirname, 'build-with-eas.bat'), easBuildScript, 'utf8');
    console.log('   ✅ Created build-with-eas.bat');
}

function runFixes() {
    try {
        fixLockfileConflict();
        createYarnInstallScript();
        updatePackageJsonForYarn();
        createEASBuildScript();
        
        console.log('\n🎉 Lockfile conflict fixes completed!\n');
        console.log('📋 Next steps:');
        console.log('1. Run: yarn-install.bat');
        console.log('2. Run: build-with-eas.bat');
        console.log('\n🔧 Manual steps if scripts fail:');
        console.log('1. yarn install');
        console.log('2. npx expo prebuild --clean');
        console.log('3. npx eas build --platform android --local');
        
    } catch (error) {
        console.error('❌ Error during fixes:', error);
        process.exit(1);
    }
}

runFixes();
