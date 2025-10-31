const { withProjectBuildGradle } = require('@expo/config-plugins');

const withKotlinVersion = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('kotlinVersion')) {
      return config;
    }

    // Modificar build.gradle para agregar kotlinVersion
    config.modResults.contents = config.modResults.contents.replace(
      /buildscript\s*{/,
      `buildscript {
  ext {
    kotlinVersion = '2.0.21'
  }`
    );

    // Modificar la dependencia de Kotlin
    config.modResults.contents = config.modResults.contents.replace(
      /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin['"]\)/,
      `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")`
    );

    return config;
  });
};

module.exports = withKotlinVersion;
