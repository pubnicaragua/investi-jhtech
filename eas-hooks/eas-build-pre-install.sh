#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Fixing Kotlin version in build.gradle..."

# Este script se ejecuta DESPUÉS de expo prebuild pero ANTES de la instalación de dependencias
# Necesitamos modificar el build.gradle generado

BUILD_GRADLE="$EAS_BUILD_WORKINGDIR/android/build.gradle"

if [ -f "$BUILD_GRADLE" ]; then
  echo "📝 Modifying $BUILD_GRADLE"
  
  # Agregar kotlinVersion en buildscript
  sed -i 's/buildscript {/buildscript {\n  ext {\n    kotlinVersion = '\''1.9.24'\''\n  }/' "$BUILD_GRADLE"
  
  # Modificar la dependencia de Kotlin para usar la variable
  sed -i "s/classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')/classpath(\"org.jetbrains.kotlin:kotlin-gradle-plugin:\$kotlinVersion\")/" "$BUILD_GRADLE"
  
  echo "✅ build.gradle modified successfully"
  cat "$BUILD_GRADLE"
else
  echo "❌ build.gradle not found at $BUILD_GRADLE"
  exit 1
fi
